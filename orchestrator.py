"""
Cognitive router: prompt → memory retrieval → web search if needed → LLM → encode.

Every user interaction, tool result, and correction is vectorized into the
memory network with temporal + importance/emotional weights.
"""

from __future__ import annotations

import logging
import re
import uuid
from dataclasses import dataclass, field
from typing import Any, Optional

from config import Settings, get_settings
from llm_client import LLMClient
from memory_network import MemoryNetwork

logger = logging.getLogger(__name__)

SEARCH_HINTS = re.compile(
    r"\b(latest|today|current|news|who is|what is happening|search|look up|"
    r"price of|weather|stock|recent|202[4-9]|2026)\b",
    re.IGNORECASE,
)

SYSTEM_CORE = """You are the Autonomous Self-Evolving AI Orchestrator — a cloud-hosted
assistant with a persistent vector memory graph.

Rules:
1. Use retrieved memories and core lessons when relevant; cite them naturally.
2. If web search results are provided, prefer them for time-sensitive facts.
3. Be concise, accurate, and honest about uncertainty.
4. Never invent API keys or claim local laptop access — you run fully in the cloud.
5. When the user corrects you, acknowledge and treat it as high-priority learning.
"""


@dataclass
class OrchestratorResult:
    reply: str
    session_id: str
    used_web_search: bool = False
    memories_used: list[dict[str, Any]] = field(default_factory=list)
    memory_ids: list[str] = field(default_factory=list)
    provider: str = "none"
    error: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "reply": self.reply,
            "session_id": self.session_id,
            "used_web_search": self.used_web_search,
            "memories_used": self.memories_used,
            "memory_ids": self.memory_ids,
            "provider": self.provider,
            "error": self.error,
        }


class Orchestrator:
    """End-to-end cognitive loop for a single user turn."""

    def __init__(
        self,
        settings: Optional[Settings] = None,
        llm: Optional[LLMClient] = None,
        memory: Optional[MemoryNetwork] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.llm = llm or LLMClient(self.settings)
        self.memory = memory or MemoryNetwork(self.settings, self.llm)

    def status(self) -> dict[str, Any]:
        return {
            "llm": self.llm.status(),
            "memory": self.memory.status(),
            "web_search_enabled": self.settings.web_search_enabled,
        }

    def _needs_web_search(self, prompt: str) -> bool:
        if not self.settings.web_search_enabled:
            return False
        return bool(SEARCH_HINTS.search(prompt))

    def _web_search(self, query: str) -> list[dict[str, str]]:
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            try:
                from ddgs import DDGS  # type: ignore
            except ImportError:
                logger.warning("duckduckgo_search not installed")
                return []
        results: list[dict[str, str]] = []
        try:
            with DDGS() as ddgs:
                for item in ddgs.text(query, max_results=self.settings.web_search_max_results):
                    results.append(
                        {
                            "title": item.get("title") or "",
                            "href": item.get("href") or item.get("link") or "",
                            "body": item.get("body") or item.get("snippet") or "",
                        }
                    )
        except Exception as exc:  # noqa: BLE001
            logger.warning("DuckDuckGo search failed: %s", exc)
        return results

    def _estimate_importance(self, text: str, *, is_correction: bool = False) -> float:
        if is_correction:
            return 0.95
        length_boost = min(0.2, len(text) / 2000.0)
        if any(w in text.lower() for w in ("prefer", "always", "never", "remember", "my name")):
            return min(1.0, 0.75 + length_boost)
        return min(1.0, 0.45 + length_boost)

    def _estimate_emotion(self, text: str, *, is_correction: bool = False) -> float:
        if is_correction:
            return -0.6
        lower = text.lower()
        if any(w in lower for w in ("thank", "great", "love", "awesome")):
            return 0.4
        if any(w in lower for w in ("wrong", "hate", "angry", "frustrated", "bad")):
            return -0.4
        return 0.0

    def _is_correction(self, text: str) -> bool:
        return bool(
            re.search(
                r"\b(no[,.]?\s+that'?s wrong|incorrect|actually[, ]|correction:|"
                r"you'?re wrong|don'?t say|stop saying)\b",
                text,
                re.IGNORECASE,
            )
        )

    async def handle(
        self,
        prompt: str,
        *,
        session_id: Optional[str] = None,
        force_web_search: bool = False,
    ) -> OrchestratorResult:
        text = (prompt or "").strip()
        sid = session_id or str(uuid.uuid4())
        if not text:
            return OrchestratorResult(
                reply="Please send a non-empty message.",
                session_id=sid,
                error="empty_prompt",
            )

        is_corr = self._is_correction(text)
        importance = self._estimate_importance(text, is_correction=is_corr)
        emotion = self._estimate_emotion(text, is_correction=is_corr)
        content_type = "correction" if is_corr else "interaction"

        await self.memory.log_interaction("user", text, session_id=sid)
        user_node = await self.memory.insert_memory(
            text,
            content_type=content_type,
            importance=importance,
            emotional_weight=emotion,
            session_id=sid,
            source="user",
        )

        memories = await self.memory.semantic_search(text, top_k=self.settings.memory_top_k)
        lessons = await self.memory.list_active_lessons(limit=8)

        used_search = False
        search_results: list[dict[str, str]] = []
        if force_web_search or self._needs_web_search(text):
            search_results = self._web_search(text)
            used_search = bool(search_results)
            if search_results:
                summary = "\n".join(
                    f"- {r['title']}: {r['body'][:240]}" for r in search_results[:5]
                )
                search_node = await self.memory.insert_memory(
                    f"Web search for '{text}':\n{summary}",
                    content_type="search",
                    importance=0.55,
                    emotional_weight=0.0,
                    session_id=sid,
                    source="duckduckgo",
                    link_to=user_node.id,
                    relation="derived_from",
                )
                # encode tool result
                await self.memory.log_interaction(
                    "tool",
                    summary,
                    session_id=sid,
                    metadata={"tool": "duckduckgo_search"},
                )
                _ = search_node

        memory_block = "\n".join(
            f"- [{m.content_type}|imp={m.importance:.2f}|sim={m.similarity or 0:.2f}] {m.content[:400]}"
            for m in memories
        ) or "(no prior memories)"
        lesson_block = "\n".join(
            f"- ({l.get('confidence', 0):.2f}) {l.get('lesson')}" for l in lessons
        ) or "(no core lessons yet)"
        search_block = (
            "\n".join(f"- {r['title']}: {r['body'][:300]} ({r['href']})" for r in search_results)
            if search_results
            else "(no web search)"
        )

        messages = [
            {"role": "system", "content": SYSTEM_CORE},
            {
                "role": "system",
                "content": (
                    f"CORE LESSONS:\n{lesson_block}\n\n"
                    f"RETRIEVED MEMORIES:\n{memory_block}\n\n"
                    f"WEB SEARCH:\n{search_block}"
                ),
            },
            {"role": "user", "content": text},
        ]

        provider = self.settings.resolved_llm_provider()
        try:
            if not self.llm.available:
                reply = (
                    "I am running, but no LLM API key is configured. "
                    "Set GROQ_API_KEY (recommended) or HF_API_TOKEN on Render, then redeploy. "
                    f"Your message was stored in {self.memory.backend} memory."
                )
                err = "no_llm"
            else:
                reply = await self.llm.chat(messages, temperature=0.35, max_tokens=1200)
                err = None
        except Exception as exc:  # noqa: BLE001
            logger.exception("LLM chat failed")
            reply = (
                f"I hit an LLM error: {exc}. "
                "Your message was still saved to memory. Check GROQ_API_KEY / HF_API_TOKEN."
            )
            err = str(exc)

        assistant_node = await self.memory.insert_memory(
            reply,
            content_type="interaction",
            importance=0.5,
            emotional_weight=0.05,
            session_id=sid,
            source="assistant",
            link_to=user_node.id,
            relation="related",
        )
        await self.memory.log_interaction("assistant", reply, session_id=sid)

        if is_corr:
            await self.memory.save_lesson(
                f"User correction: {text[:500]}",
                category="correction",
                confidence=0.85,
                source_run=sid,
            )

        return OrchestratorResult(
            reply=reply,
            session_id=sid,
            used_web_search=used_search,
            memories_used=[m.to_dict() for m in memories[:5]],
            memory_ids=[user_node.id, assistant_node.id],
            provider=provider,
            error=err,
        )
