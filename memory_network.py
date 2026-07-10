"""
Cloud vector memory graph with temporal + importance/emotional weights.

Primary backend: Supabase (PostgREST) + pgvector via match_memory_nodes RPC.
Fallback: local SQLite so the app runs without cloud DB.
"""

from __future__ import annotations

import json
import logging
import math
import sqlite3
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

from config import Settings, get_settings
from llm_client import LLMClient, hashing_embed

logger = logging.getLogger(__name__)


def _iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _parse_ts(value: Any) -> Optional[datetime]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    text = str(value).replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(text)
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a)) or 1.0
    nb = math.sqrt(sum(y * y for y in b)) or 1.0
    return float(dot / (na * nb))


@dataclass
class MemoryNode:
    id: str
    content: str
    content_type: str = "interaction"
    importance: float = 0.5
    emotional_weight: float = 0.0
    temporal_weight: float = 1.0
    forgotten: bool = False
    session_id: Optional[str] = None
    source: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: Optional[str] = None
    similarity: Optional[float] = None
    embedding: Optional[list[float]] = None

    def score(self) -> float:
        sim = self.similarity if self.similarity is not None else 0.5
        emotion_boost = 1.0 + abs(self.emotional_weight) * 0.25
        return float(sim * self.temporal_weight * max(self.importance, 0.05) * emotion_boost)

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d.pop("embedding", None)
        return d


@dataclass
class MemoryEdge:
    id: str
    from_id: str
    to_id: str
    relation: str = "related"
    weight: float = 0.5
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: Optional[str] = None


class MemoryNetwork:
    """Unified memory API: insert, semantic search, edges, pruning, lessons."""

    def __init__(
        self,
        settings: Optional[Settings] = None,
        llm: Optional[LLMClient] = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.llm = llm or LLMClient(self.settings)
        self._supabase = None
        self._backend = "sqlite"
        self._init_backend()

    def _init_backend(self) -> None:
        if self.settings.has_supabase:
            try:
                from supabase import create_client

                self._supabase = create_client(
                    self.settings.supabase_url,
                    self.settings.supabase_service_role_key,
                )
                self._backend = "supabase"
                logger.info("Memory backend: Supabase pgvector")
                return
            except Exception as exc:  # noqa: BLE001
                logger.warning("Supabase init failed, SQLite fallback: %s", exc)
        self._backend = "sqlite"
        self._ensure_sqlite()
        logger.info("Memory backend: SQLite (%s)", self.settings.local_memory_path)

    @property
    def backend(self) -> str:
        return self._backend

    def status(self) -> dict[str, Any]:
        return {
            "backend": self._backend,
            "supabase_configured": self.settings.has_supabase,
            "embedding_dim": self.settings.embedding_dim,
        }

    def _sqlite_path(self) -> Path:
        path = Path(self.settings.local_memory_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    def _connect_sqlite(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self._sqlite_path()), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def _ensure_sqlite(self) -> None:
        with self._connect_sqlite() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS memory_nodes (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    content_type TEXT NOT NULL DEFAULT 'interaction',
                    embedding TEXT,
                    importance REAL NOT NULL DEFAULT 0.5,
                    emotional_weight REAL NOT NULL DEFAULT 0.0,
                    temporal_weight REAL NOT NULL DEFAULT 1.0,
                    forgotten INTEGER NOT NULL DEFAULT 0,
                    session_id TEXT,
                    source TEXT,
                    metadata TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    last_accessed_at TEXT
                );
                CREATE TABLE IF NOT EXISTS memory_edges (
                    id TEXT PRIMARY KEY,
                    from_id TEXT NOT NULL,
                    to_id TEXT NOT NULL,
                    relation TEXT NOT NULL DEFAULT 'related',
                    weight REAL NOT NULL DEFAULT 0.5,
                    metadata TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    UNIQUE(from_id, to_id, relation),
                    FOREIGN KEY(from_id) REFERENCES memory_nodes(id) ON DELETE CASCADE,
                    FOREIGN KEY(to_id) REFERENCES memory_nodes(id) ON DELETE CASCADE
                );
                CREATE TABLE IF NOT EXISTS interaction_logs (
                    id TEXT PRIMARY KEY,
                    session_id TEXT,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    metadata TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS core_lessons (
                    id TEXT PRIMARY KEY,
                    lesson TEXT NOT NULL,
                    category TEXT NOT NULL DEFAULT 'general',
                    confidence REAL NOT NULL DEFAULT 0.7,
                    source_run TEXT,
                    active INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS evolution_runs (
                    id TEXT PRIMARY KEY,
                    started_at TEXT NOT NULL,
                    finished_at TEXT,
                    status TEXT NOT NULL DEFAULT 'running',
                    phase_results TEXT NOT NULL DEFAULT '{}',
                    error TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_nodes_created ON memory_nodes(created_at);
                CREATE INDEX IF NOT EXISTS idx_logs_created ON interaction_logs(created_at);
                """
            )
            conn.commit()

    async def insert_memory(
        self,
        content: str,
        *,
        content_type: str = "interaction",
        importance: float = 0.5,
        emotional_weight: float = 0.0,
        temporal_weight: float = 1.0,
        session_id: Optional[str] = None,
        source: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
        link_to: Optional[str] = None,
        relation: str = "related",
    ) -> MemoryNode:
        text = (content or "").strip()
        if not text:
            raise ValueError("Memory content cannot be empty.")
        embedding = await self.llm.embed(text)
        node_id = str(uuid.uuid4())
        now = _iso_now()
        node = MemoryNode(
            id=node_id,
            content=text,
            content_type=content_type,
            importance=float(max(0.0, min(1.0, importance))),
            emotional_weight=float(max(-1.0, min(1.0, emotional_weight))),
            temporal_weight=float(max(0.0, temporal_weight)),
            forgotten=False,
            session_id=session_id,
            source=source,
            metadata=metadata or {},
            created_at=now,
            embedding=embedding,
        )
        if self._backend == "supabase" and self._supabase is not None:
            await self._supabase_insert(node)
        else:
            self._sqlite_insert(node)
        if link_to:
            await self.link_memories(node.id, link_to, relation=relation, weight=0.6)
        return node

    async def _supabase_insert(self, node: MemoryNode) -> None:
        assert self._supabase is not None
        payload = {
            "id": node.id,
            "content": node.content,
            "content_type": node.content_type,
            "embedding": node.embedding,
            "importance": node.importance,
            "emotional_weight": node.emotional_weight,
            "temporal_weight": node.temporal_weight,
            "forgotten": node.forgotten,
            "session_id": node.session_id,
            "source": node.source,
            "metadata": node.metadata,
            "created_at": node.created_at,
            "updated_at": node.created_at,
        }
        try:
            self._supabase.table("memory_nodes").insert(payload).execute()
        except Exception as exc:  # noqa: BLE001
            raise RuntimeError(f"Could not store memory in Supabase: {exc}") from exc

    def _sqlite_insert(self, node: MemoryNode) -> None:
        with self._connect_sqlite() as conn:
            conn.execute(
                """
                INSERT INTO memory_nodes (
                    id, content, content_type, embedding, importance,
                    emotional_weight, temporal_weight, forgotten, session_id,
                    source, metadata, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    node.id, node.content, node.content_type, json.dumps(node.embedding),
                    node.importance, node.emotional_weight, node.temporal_weight, 0,
                    node.session_id, node.source, json.dumps(node.metadata),
                    node.created_at, node.created_at,
                ),
            )
            conn.commit()

    async def semantic_search(
        self,
        query: str,
        *,
        top_k: Optional[int] = None,
        min_importance: float = 0.0,
        include_forgotten: bool = False,
        content_types: Optional[list[str]] = None,
    ) -> list[MemoryNode]:
        k = top_k or self.settings.memory_top_k
        embedding = await self.llm.embed(query)
        if self._backend == "supabase" and self._supabase is not None:
            nodes = await self._supabase_search(
                embedding, k=k, min_importance=min_importance, include_forgotten=include_forgotten
            )
        else:
            nodes = self._sqlite_search(
                embedding, k=max(k * 3, 24), min_importance=min_importance, include_forgotten=include_forgotten
            )
        if content_types:
            allowed = set(content_types)
            nodes = [n for n in nodes if n.content_type in allowed]
        now = datetime.now(timezone.utc)
        for n in nodes:
            created = _parse_ts(n.created_at) or now
            age_hours = max((now - created).total_seconds() / 3600.0, 0.0)
            decay = 0.5 ** (age_hours / (14 * 24))
            n.temporal_weight = max(0.05, n.temporal_weight * decay)
        nodes.sort(key=lambda n: n.score(), reverse=True)
        return nodes[:k]

    async def _supabase_search(
        self, embedding: list[float], *, k: int, min_importance: float, include_forgotten: bool
    ) -> list[MemoryNode]:
        assert self._supabase is not None
        try:
            resp = self._supabase.rpc(
                "match_memory_nodes",
                {
                    "query_embedding": embedding,
                    "match_count": k,
                    "min_importance": min_importance,
                    "include_forgotten": include_forgotten,
                },
            ).execute()
            rows = resp.data or []
        except Exception as exc:  # noqa: BLE001
            logger.warning("Supabase RPC search failed: %s", exc)
            return []
        nodes: list[MemoryNode] = []
        for row in rows:
            meta = row.get("metadata") or {}
            if isinstance(meta, str):
                try:
                    meta = json.loads(meta)
                except json.JSONDecodeError:
                    meta = {}
            nodes.append(
                MemoryNode(
                    id=str(row["id"]),
                    content=row["content"],
                    content_type=row.get("content_type") or "interaction",
                    importance=float(row.get("importance") or 0.5),
                    emotional_weight=float(row.get("emotional_weight") or 0.0),
                    temporal_weight=float(row.get("temporal_weight") or 1.0),
                    forgotten=bool(row.get("forgotten")),
                    session_id=row.get("session_id"),
                    source=row.get("source"),
                    metadata=meta,
                    created_at=str(row.get("created_at") or ""),
                    similarity=float(row.get("similarity") or 0.0),
                )
            )
        return nodes

    def _sqlite_search(
        self, embedding: list[float], *, k: int, min_importance: float, include_forgotten: bool
    ) -> list[MemoryNode]:
        with self._connect_sqlite() as conn:
            rows = conn.execute(
                """
                SELECT * FROM memory_nodes
                WHERE importance >= ? AND (? = 1 OR forgotten = 0)
                """,
                (min_importance, 1 if include_forgotten else 0),
            ).fetchall()
        scored: list[MemoryNode] = []
        for row in rows:
            try:
                emb = json.loads(row["embedding"] or "[]")
            except json.JSONDecodeError:
                emb = hashing_embed(row["content"], self.settings.embedding_dim)
            sim = cosine_similarity(embedding, emb)
            try:
                meta = json.loads(row["metadata"] or "{}")
            except json.JSONDecodeError:
                meta = {}
            scored.append(
                MemoryNode(
                    id=row["id"], content=row["content"], content_type=row["content_type"],
                    importance=float(row["importance"]), emotional_weight=float(row["emotional_weight"]),
                    temporal_weight=float(row["temporal_weight"]), forgotten=bool(row["forgotten"]),
                    session_id=row["session_id"], source=row["source"], metadata=meta,
                    created_at=row["created_at"], similarity=sim, embedding=emb,
                )
            )
        scored.sort(key=lambda n: n.similarity or 0.0, reverse=True)
        return scored[:k]

    async def link_memories(
        self, from_id: str, to_id: str, *, relation: str = "related",
        weight: float = 0.5, metadata: Optional[dict[str, Any]] = None,
    ) -> MemoryEdge:
        edge = MemoryEdge(
            id=str(uuid.uuid4()), from_id=from_id, to_id=to_id, relation=relation,
            weight=float(max(0.0, min(1.0, weight))), metadata=metadata or {}, created_at=_iso_now(),
        )
        if self._backend == "supabase" and self._supabase is not None:
            try:
                self._supabase.table("memory_edges").upsert(
                    {
                        "id": edge.id, "from_id": edge.from_id, "to_id": edge.to_id,
                        "relation": edge.relation, "weight": edge.weight,
                        "metadata": edge.metadata, "created_at": edge.created_at,
                    },
                    on_conflict="from_id,to_id,relation",
                ).execute()
            except Exception as exc:  # noqa: BLE001
                logger.warning("Supabase edge upsert failed: %s", exc)
        else:
            with self._connect_sqlite() as conn:
                conn.execute(
                    """
                    INSERT INTO memory_edges (id, from_id, to_id, relation, weight, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(from_id, to_id, relation) DO UPDATE SET
                        weight = excluded.weight, metadata = excluded.metadata
                    """,
                    (edge.id, edge.from_id, edge.to_id, edge.relation, edge.weight,
                     json.dumps(edge.metadata), edge.created_at),
                )
                conn.commit()
        return edge

    async def get_related(self, node_id: str, limit: int = 10) -> list[dict[str, Any]]:
        if self._backend == "supabase" and self._supabase is not None:
            try:
                resp = (
                    self._supabase.table("memory_edges").select("*")
                    .or_(f"from_id.eq.{node_id},to_id.eq.{node_id}").limit(limit).execute()
                )
                return resp.data or []
            except Exception as exc:  # noqa: BLE001
                logger.warning("get_related failed: %s", exc)
                return []
        with self._connect_sqlite() as conn:
            rows = conn.execute(
                """
                SELECT * FROM memory_edges WHERE from_id = ? OR to_id = ?
                ORDER BY weight DESC LIMIT ?
                """,
                (node_id, node_id, limit),
            ).fetchall()
        return [dict(r) for r in rows]

    async def log_interaction(
        self, role: str, content: str, *, session_id: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> str:
        log_id = str(uuid.uuid4())
        now = _iso_now()
        meta = metadata or {}
        if self._backend == "supabase" and self._supabase is not None:
            try:
                self._supabase.table("interaction_logs").insert(
                    {"id": log_id, "session_id": session_id, "role": role,
                     "content": content, "metadata": meta, "created_at": now}
                ).execute()
            except Exception as exc:  # noqa: BLE001
                logger.warning("log insert failed: %s", exc)
        else:
            with self._connect_sqlite() as conn:
                conn.execute(
                    """
                    INSERT INTO interaction_logs (id, session_id, role, content, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (log_id, session_id, role, content, json.dumps(meta), now),
                )
                conn.commit()
        return log_id

    async def fetch_logs_since(self, since: datetime) -> list[dict[str, Any]]:
        since_iso = since.astimezone(timezone.utc).replace(microsecond=0).isoformat()
        if self._backend == "supabase" and self._supabase is not None:
            try:
                resp = (
                    self._supabase.table("interaction_logs").select("*")
                    .gte("created_at", since_iso).order("created_at", desc=False).limit(500).execute()
                )
                return resp.data or []
            except Exception as exc:  # noqa: BLE001
                logger.warning("fetch_logs_since failed: %s", exc)
                return []
        with self._connect_sqlite() as conn:
            rows = conn.execute(
                """
                SELECT * FROM interaction_logs WHERE created_at >= ?
                ORDER BY created_at ASC LIMIT 500
                """,
                (since_iso,),
            ).fetchall()
        out = []
        for r in rows:
            d = dict(r)
            try:
                d["metadata"] = json.loads(d.get("metadata") or "{}")
            except json.JSONDecodeError:
                d["metadata"] = {}
            out.append(d)
        return out

    async def save_lesson(
        self, lesson: str, *, category: str = "general", confidence: float = 0.7,
        source_run: Optional[str] = None,
    ) -> dict[str, Any]:
        lesson_id = str(uuid.uuid4())
        now = _iso_now()
        row = {
            "id": lesson_id, "lesson": lesson.strip(), "category": category,
            "confidence": float(max(0.0, min(1.0, confidence))),
            "source_run": source_run, "active": True, "created_at": now, "updated_at": now,
        }
        await self.insert_memory(
            lesson.strip(), content_type="lesson",
            importance=min(1.0, 0.7 + confidence * 0.3), emotional_weight=0.2,
            source="self_correction", metadata={"lesson_id": lesson_id, "category": category},
        )
        if self._backend == "supabase" and self._supabase is not None:
            try:
                self._supabase.table("core_lessons").insert(row).execute()
            except Exception as exc:  # noqa: BLE001
                logger.warning("save_lesson failed: %s", exc)
        else:
            with self._connect_sqlite() as conn:
                conn.execute(
                    """
                    INSERT INTO core_lessons
                    (id, lesson, category, confidence, source_run, active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
                    """,
                    (lesson_id, row["lesson"], category, row["confidence"], source_run, now, now),
                )
                conn.commit()
        return row

    async def list_active_lessons(self, limit: int = 20) -> list[dict[str, Any]]:
        if self._backend == "supabase" and self._supabase is not None:
            try:
                resp = (
                    self._supabase.table("core_lessons").select("*").eq("active", True)
                    .order("confidence", desc=True).limit(limit).execute()
                )
                return resp.data or []
            except Exception as exc:  # noqa: BLE001
                logger.warning("list_active_lessons failed: %s", exc)
                return []
        with self._connect_sqlite() as conn:
            rows = conn.execute(
                "SELECT * FROM core_lessons WHERE active = 1 ORDER BY confidence DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]

    async def reweight_and_prune(self) -> dict[str, int]:
        now = datetime.now(timezone.utc)
        forgotten = 0
        updated = 0
        min_keep = self.settings.min_importance_keep
        max_age_days = self.settings.prune_forgotten_after_days
        if self._backend == "supabase" and self._supabase is not None:
            try:
                resp = (
                    self._supabase.table("memory_nodes")
                    .select("id,importance,temporal_weight,created_at,forgotten,content_type")
                    .eq("forgotten", False).limit(1000).execute()
                )
                rows = resp.data or []
            except Exception as exc:  # noqa: BLE001
                logger.warning("prune fetch failed: %s", exc)
                return {"updated": 0, "forgotten": 0}
            for row in rows:
                created = _parse_ts(row.get("created_at")) or now
                age_days = (now - created).total_seconds() / 86400.0
                new_temporal = max(0.05, float(row.get("temporal_weight") or 1.0) * (0.5 ** (age_days / 14.0)))
                importance = float(row.get("importance") or 0.5)
                ctype = row.get("content_type") or ""
                should_forget = (
                    ctype not in {"lesson", "preference", "correction"}
                    and importance < min_keep and age_days > max_age_days
                )
                patch: dict[str, Any] = {"temporal_weight": new_temporal, "updated_at": _iso_now()}
                if should_forget:
                    patch["forgotten"] = True
                    forgotten += 1
                try:
                    self._supabase.table("memory_nodes").update(patch).eq("id", row["id"]).execute()
                    updated += 1
                except Exception as exc:  # noqa: BLE001
                    logger.debug("prune update skipped: %s", exc)
            return {"updated": updated, "forgotten": forgotten}
        with self._connect_sqlite() as conn:
            rows = conn.execute("SELECT * FROM memory_nodes WHERE forgotten = 0").fetchall()
            for row in rows:
                created = _parse_ts(row["created_at"]) or now
                age_days = (now - created).total_seconds() / 86400.0
                new_temporal = max(0.05, float(row["temporal_weight"]) * (0.5 ** (age_days / 14.0)))
                should_forget = (
                    row["content_type"] not in {"lesson", "preference", "correction"}
                    and float(row["importance"]) < min_keep and age_days > max_age_days
                )
                conn.execute(
                    "UPDATE memory_nodes SET temporal_weight = ?, forgotten = ?, updated_at = ? WHERE id = ?",
                    (new_temporal, 1 if should_forget else 0, _iso_now(), row["id"]),
                )
                updated += 1
                if should_forget:
                    forgotten += 1
            conn.commit()
        return {"updated": updated, "forgotten": forgotten}

    async def start_evolution_run(self) -> str:
        run_id = str(uuid.uuid4())
        now = _iso_now()
        if self._backend == "supabase" and self._supabase is not None:
            try:
                self._supabase.table("evolution_runs").insert(
                    {"id": run_id, "started_at": now, "status": "running", "phase_results": {}}
                ).execute()
            except Exception as exc:  # noqa: BLE001
                logger.warning("evolution_runs insert failed: %s", exc)
        else:
            with self._connect_sqlite() as conn:
                conn.execute(
                    "INSERT INTO evolution_runs (id, started_at, status, phase_results) VALUES (?, ?, 'running', '{}')",
                    (run_id, now),
                )
                conn.commit()
        return run_id

    async def finish_evolution_run(
        self, run_id: str, *, status: str, phase_results: dict[str, Any], error: Optional[str] = None,
    ) -> None:
        now = _iso_now()
        if self._backend == "supabase" and self._supabase is not None:
            try:
                self._supabase.table("evolution_runs").update(
                    {"finished_at": now, "status": status, "phase_results": phase_results, "error": error}
                ).eq("id", run_id).execute()
            except Exception as exc:  # noqa: BLE001
                logger.warning("evolution_runs update failed: %s", exc)
        else:
            with self._connect_sqlite() as conn:
                conn.execute(
                    "UPDATE evolution_runs SET finished_at = ?, status = ?, phase_results = ?, error = ? WHERE id = ?",
                    (now, status, json.dumps(phase_results), error, run_id),
                )
                conn.commit()

    async def recent_memories(self, hours: int = 24, limit: int = 200) -> list[MemoryNode]:
        since = datetime.now(timezone.utc) - timedelta(hours=hours)
        since_iso = since.replace(microsecond=0).isoformat()
        if self._backend == "supabase" and self._supabase is not None:
            try:
                resp = (
                    self._supabase.table("memory_nodes").select("*")
                    .gte("created_at", since_iso).order("created_at", desc=True).limit(limit).execute()
                )
                rows = resp.data or []
                nodes = []
                for row in rows:
                    meta = row.get("metadata") or {}
                    if isinstance(meta, str):
                        try:
                            meta = json.loads(meta)
                        except json.JSONDecodeError:
                            meta = {}
                    nodes.append(MemoryNode(
                        id=str(row["id"]), content=row["content"],
                        content_type=row.get("content_type") or "interaction",
                        importance=float(row.get("importance") or 0.5),
                        emotional_weight=float(row.get("emotional_weight") or 0.0),
                        temporal_weight=float(row.get("temporal_weight") or 1.0),
                        forgotten=bool(row.get("forgotten")), session_id=row.get("session_id"),
                        source=row.get("source"), metadata=meta, created_at=str(row.get("created_at") or ""),
                    ))
                return nodes
            except Exception as exc:  # noqa: BLE001
                logger.warning("recent_memories failed: %s", exc)
                return []
        with self._connect_sqlite() as conn:
            rows = conn.execute(
                "SELECT * FROM memory_nodes WHERE created_at >= ? ORDER BY created_at DESC LIMIT ?",
                (since_iso, limit),
            ).fetchall()
        out = []
        for row in rows:
            try:
                meta = json.loads(row["metadata"] or "{}")
            except json.JSONDecodeError:
                meta = {}
            out.append(MemoryNode(
                id=row["id"], content=row["content"], content_type=row["content_type"],
                importance=float(row["importance"]), emotional_weight=float(row["emotional_weight"]),
                temporal_weight=float(row["temporal_weight"]), forgotten=bool(row["forgotten"]),
                session_id=row["session_id"], source=row["source"], metadata=meta, created_at=row["created_at"],
            ))
        return out
