"""Smoke tests that do not require network API keys."""

from __future__ import annotations

import asyncio
import os
import tempfile
from pathlib import Path

# Force local sqlite before imports that cache settings
os.environ["LOCAL_MEMORY_PATH"] = str(Path(tempfile.mkdtemp()) / "t.db")
os.environ.pop("SUPABASE_URL", None)
os.environ.pop("SUPABASE_SERVICE_ROLE_KEY", None)
os.environ.pop("GROQ_API_KEY", None)
os.environ.pop("HF_API_TOKEN", None)

from config import reset_settings_cache, get_settings
from llm_client import hashing_embed, LLMClient
from memory_network import MemoryNetwork
from orchestrator import Orchestrator


def test_hashing_embed_dim():
    v = hashing_embed("hello world", 384)
    assert len(v) == 384
    assert abs(sum(x * x for x in v) - 1.0) < 1e-5


def test_memory_roundtrip():
    reset_settings_cache()
    settings = get_settings()
    llm = LLMClient(settings)
    mem = MemoryNetwork(settings, llm)

    async def run():
        n = await mem.insert_memory("User prefers concise answers.", content_type="preference", importance=0.9)
        hits = await mem.semantic_search("concise answers preference", top_k=3)
        assert any(h.id == n.id for h in hits)
        lesson = await mem.save_lesson("Prefer brevity.", category="style", confidence=0.8)
        assert lesson["lesson"]

    asyncio.run(run())


def test_orchestrator_without_llm():
    reset_settings_cache()
    settings = get_settings()
    orch = Orchestrator(settings)

    async def run():
        result = await orch.handle("Hello there")
        assert result.reply
        assert result.session_id
        assert result.error == "no_llm"

    asyncio.run(run())
