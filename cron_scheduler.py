"""
Nightly (24h) self-evolution loop via APScheduler.

Phases:
  1. Consolidation — gather last 24h logs/memories
  2. Fact Extraction — LLM extracts facts/prefs/corrections
  3. Synaptic Pruning & Reweighting — decay + forget low-value nodes
  4. Self-Correction — write lessons into core memory

Runs inside the same Render web process (free-tier friendly).
Also exposes a manual trigger for /admin/evolve and Render Cron Jobs.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from config import Settings, get_settings
from llm_client import LLMClient
from memory_network import MemoryNetwork

logger = logging.getLogger(__name__)

EXTRACT_SYSTEM = """You extract durable knowledge from recent AI interaction logs.
Return ONLY valid JSON with this shape:
{
  "facts": [{"text": "...", "importance": 0.0-1.0}],
  "preferences": [{"text": "...", "importance": 0.0-1.0}],
  "corrections": [{"text": "...", "importance": 0.0-1.0}],
  "lessons": [{"text": "...", "confidence": 0.0-1.0, "category": "general|style|factual|safety"}]
}
If nothing useful, return empty arrays. No markdown fences.
"""


class EvolutionScheduler:
    """Owns the APScheduler instance and evolution pipeline."""

    def __init__(
        self,
        settings: Optional[Settings] = None,
        llm: Optional[LLMClient] = None,
        memory: Optional[MemoryNetwork] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.llm = llm or LLMClient(self.settings)
        self.memory = memory or MemoryNetwork(self.settings, self.llm)
        self.scheduler: Optional[AsyncIOScheduler] = None
        self._running = False
        self.last_run: Optional[dict[str, Any]] = None

    def status(self) -> dict[str, Any]:
        jobs = []
        if self.scheduler:
            for job in self.scheduler.get_jobs():
                jobs.append(
                    {
                        "id": job.id,
                        "next_run_time": str(job.next_run_time) if job.next_run_time else None,
                    }
                )
        return {
            "enabled": self.settings.cron_enabled,
            "running": self._running,
            "jobs": jobs,
            "last_run": self.last_run,
            "interval_hours": self.settings.evolution_interval_hours,
            "cron_utc": f"{self.settings.cron_hour_utc:02d}:{self.settings.cron_minute_utc:02d}",
        }

    def start(self) -> None:
        if not self.settings.cron_enabled:
            logger.info("Evolution cron disabled via CRON_ENABLED=false")
            return
        if self.scheduler is not None:
            return
        self.scheduler = AsyncIOScheduler(timezone="UTC")
        # Interval job: reliable on free Render (always-on process)
        self.scheduler.add_job(
            self.run_evolution_cycle,
            trigger=IntervalTrigger(hours=max(1, self.settings.evolution_interval_hours)),
            id="evolution_interval",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        # Also schedule a daily UTC cron for predictability
        self.scheduler.add_job(
            self.run_evolution_cycle,
            trigger=CronTrigger(
                hour=self.settings.cron_hour_utc,
                minute=self.settings.cron_minute_utc,
                timezone="UTC",
            ),
            id="evolution_daily_cron",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        self.scheduler.start()
        logger.info(
            "Evolution scheduler started (every %sh + daily %02d:%02d UTC)",
            self.settings.evolution_interval_hours,
            self.settings.cron_hour_utc,
            self.settings.cron_minute_utc,
        )

    def shutdown(self) -> None:
        if self.scheduler:
            self.scheduler.shutdown(wait=False)
            self.scheduler = None

    async def run_evolution_cycle(self) -> dict[str, Any]:
        if self._running:
            return {"status": "skipped", "reason": "already_running"}
        self._running = True
        run_id = await self.memory.start_evolution_run()
        phase_results: dict[str, Any] = {}
        error: Optional[str] = None
        status = "ok"
        try:
            phase_results["consolidation"] = await self._phase_consolidation()
            phase_results["fact_extraction"] = await self._phase_fact_extraction(
                phase_results["consolidation"]
            )
            phase_results["pruning"] = await self._phase_pruning()
            phase_results["self_correction"] = await self._phase_self_correction(
                phase_results.get("fact_extraction") or {}
            )
        except Exception as exc:  # noqa: BLE001
            logger.exception("Evolution cycle failed")
            status = "error"
            error = str(exc)
        finally:
            await self.memory.finish_evolution_run(
                run_id, status=status, phase_results=phase_results, error=error
            )
            self._running = False
            self.last_run = {
                "run_id": run_id,
                "status": status,
                "finished_at": datetime.now(timezone.utc).isoformat(),
                "phase_results": phase_results,
                "error": error,
            }
        return self.last_run

    async def _phase_consolidation(self) -> dict[str, Any]:
        since = datetime.now(timezone.utc) - timedelta(hours=24)
        logs = await self.memory.fetch_logs_since(since)
        memories = await self.memory.recent_memories(hours=24, limit=200)
        digest_lines = []
        for log in logs[-80:]:
            digest_lines.append(f"{log.get('role')}: {str(log.get('content') or '')[:400]}")
        for m in memories[:40]:
            digest_lines.append(f"memory[{m.content_type}]: {m.content[:400]}")
        digest = "\n".join(digest_lines)[:12000]
        return {
            "log_count": len(logs),
            "memory_count": len(memories),
            "digest_chars": len(digest),
            "digest": digest,
        }

    def _parse_extraction(self, raw: str) -> dict[str, Any]:
        text = raw.strip()
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        try:
            data = json.loads(text)
            if isinstance(data, dict):
                return data
        except json.JSONDecodeError:
            pass
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return {}
        return {}

    async def _phase_fact_extraction(self, consolidation: dict[str, Any]) -> dict[str, Any]:
        digest = consolidation.get("digest") or ""
        if not digest.strip():
            return {"facts": 0, "preferences": 0, "corrections": 0, "lessons": 0, "skipped": True}
        if not self.llm.available:
            return {"skipped": True, "reason": "no_llm"}

        raw = await self.llm.extract_jsonish(
            f"Extract durable knowledge from these last-24h logs:\n\n{digest}",
            EXTRACT_SYSTEM,
        )
        data = self._parse_extraction(raw)
        counts = {"facts": 0, "preferences": 0, "corrections": 0, "lessons": 0}

        for item in data.get("facts") or []:
            text = (item.get("text") if isinstance(item, dict) else str(item) or "").strip()
            if not text:
                continue
            imp = float(item.get("importance", 0.7)) if isinstance(item, dict) else 0.7
            await self.memory.insert_memory(
                text, content_type="fact", importance=imp, emotional_weight=0.1, source="evolution"
            )
            counts["facts"] += 1

        for item in data.get("preferences") or []:
            text = (item.get("text") if isinstance(item, dict) else str(item) or "").strip()
            if not text:
                continue
            imp = float(item.get("importance", 0.8)) if isinstance(item, dict) else 0.8
            await self.memory.insert_memory(
                text, content_type="preference", importance=imp, emotional_weight=0.2, source="evolution"
            )
            counts["preferences"] += 1

        for item in data.get("corrections") or []:
            text = (item.get("text") if isinstance(item, dict) else str(item) or "").strip()
            if not text:
                continue
            imp = float(item.get("importance", 0.9)) if isinstance(item, dict) else 0.9
            node = await self.memory.insert_memory(
                text, content_type="correction", importance=imp, emotional_weight=-0.5, source="evolution"
            )
            counts["corrections"] += 1
            _ = node

        # stash lessons for self-correction phase
        counts["_lessons_payload"] = data.get("lessons") or []
        return counts

    async def _phase_pruning(self) -> dict[str, Any]:
        return await self.memory.reweight_and_prune()

    async def _phase_self_correction(self, extraction: dict[str, Any]) -> dict[str, Any]:
        lessons = extraction.get("_lessons_payload") or []
        saved = 0
        for item in lessons:
            if isinstance(item, dict):
                text = (item.get("text") or "").strip()
                conf = float(item.get("confidence", 0.7))
                cat = item.get("category") or "general"
            else:
                text = str(item).strip()
                conf = 0.7
                cat = "general"
            if not text:
                continue
            await self.memory.save_lesson(text, category=cat, confidence=conf, source_run="evolution")
            saved += 1

        # If LLM unavailable but we saw corrections in consolidation, still write a baseline lesson
        if saved == 0 and not self.llm.available:
            await self.memory.save_lesson(
                "Evolution ran without LLM; keep prioritizing recent user corrections when keys are restored.",
                category="ops",
                confidence=0.5,
                source_run="evolution",
            )
            saved = 1
        return {"lessons_saved": saved}


_scheduler_singleton: Optional[EvolutionScheduler] = None


def get_evolution_scheduler(
    settings: Optional[Settings] = None,
    llm: Optional[LLMClient] = None,
    memory: Optional[MemoryNetwork] = None,
) -> EvolutionScheduler:
    global _scheduler_singleton
    if _scheduler_singleton is None:
        _scheduler_singleton = EvolutionScheduler(settings=settings, llm=llm, memory=memory)
    return _scheduler_singleton
