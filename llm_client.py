"""
OpenAI-compatible LLM + embedding clients for Groq and Hugging Face.

Gracefully degrades: if cloud embedding APIs fail, uses a deterministic
hashing embedder so the memory graph still works offline / on free tiers.
"""

from __future__ import annotations

import hashlib
import logging
import math
import re
from typing import Any, Optional

from openai import AsyncOpenAI

from config import Settings, get_settings

logger = logging.getLogger(__name__)


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9']+", (text or "").lower())


def hashing_embed(text: str, dim: int = 384) -> list[float]:
    """
    Deterministic bag-of-tokens hashing embedder (no network).

    Good enough for local/dev and as a fallback when HF embeddings are
    unavailable. Cosine-normalized.
    """
    vec = [0.0] * dim
    tokens = _tokenize(text)
    if not tokens:
        tokens = ["empty"]
    for tok in tokens:
        digest = hashlib.sha256(tok.encode("utf-8")).digest()
        idx = int.from_bytes(digest[:4], "big") % dim
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vec[idx] += sign
    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


class LLMClient:
    """Async chat + embeddings with Groq / Hugging Face failover."""

    def __init__(self, settings: Optional[Settings] = None) -> None:
        self.settings = settings or get_settings()
        self._groq: Optional[AsyncOpenAI] = None
        self._hf: Optional[AsyncOpenAI] = None

        if self.settings.has_groq:
            self._groq = AsyncOpenAI(
                api_key=self.settings.groq_api_key,
                base_url=self.settings.groq_base_url,
                timeout=60.0,
            )
        if self.settings.has_hf:
            self._hf = AsyncOpenAI(
                api_key=self.settings.hf_api_token,
                base_url=self.settings.hf_base_url,
                timeout=90.0,
            )

    @property
    def available(self) -> bool:
        return self.settings.has_llm

    def status(self) -> dict[str, Any]:
        return {
            "provider": self.settings.resolved_llm_provider(),
            "groq_configured": self.settings.has_groq,
            "huggingface_configured": self.settings.has_hf,
            "groq_model": self.settings.groq_model,
            "hf_chat_model": self.settings.hf_chat_model,
            "hf_embedding_model": self.settings.hf_embedding_model,
        }

    async def chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float = 0.4,
        max_tokens: int = 1024,
    ) -> str:
        """
        Run a chat completion. Raises RuntimeError if no provider is configured.
        """
        provider = self.settings.resolved_llm_provider()
        if provider == "none":
            raise RuntimeError(
                "No LLM API key configured. Set GROQ_API_KEY and/or HF_API_TOKEN."
            )

        errors: list[str] = []

        if provider == "groq" and self._groq:
            try:
                return await self._chat_with(
                    self._groq,
                    self.settings.groq_model,
                    messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            except Exception as exc:  # noqa: BLE001
                errors.append(f"groq: {exc}")
                logger.warning("Groq chat failed: %s", exc)
                if self._hf:
                    provider = "huggingface"

        if provider == "huggingface" and self._hf:
            try:
                return await self._chat_with(
                    self._hf,
                    self.settings.hf_chat_model,
                    messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            except Exception as exc:  # noqa: BLE001
                errors.append(f"huggingface: {exc}")
                logger.warning("HF chat failed: %s", exc)
                if self._groq and "groq" not in "".join(errors):
                    try:
                        return await self._chat_with(
                            self._groq,
                            self.settings.groq_model,
                            messages,
                            temperature=temperature,
                            max_tokens=max_tokens,
                        )
                    except Exception as exc2:  # noqa: BLE001
                        errors.append(f"groq-fallback: {exc2}")

        raise RuntimeError(
            "All LLM providers failed. " + (" | ".join(errors) if errors else "Unknown")
        )

    async def _chat_with(
        self,
        client: AsyncOpenAI,
        model: str,
        messages: list[dict[str, str]],
        *,
        temperature: float,
        max_tokens: int,
    ) -> str:
        resp = await client.chat.completions.create(
            model=model,
            messages=messages,  # type: ignore[arg-type]
            temperature=temperature,
            max_tokens=max_tokens,
        )
        choice = resp.choices[0].message
        content = (choice.content or "").strip()
        if not content:
            raise RuntimeError("LLM returned empty content.")
        return content

    async def embed(self, text: str) -> list[float]:
        """
        Embed text. Prefer HF embeddings; fall back to hashing embedder.
        """
        dim = self.settings.embedding_dim
        cleaned = (text or "").strip()
        if not cleaned:
            return hashing_embed("empty", dim)

        if self._hf:
            try:
                resp = await self._hf.embeddings.create(
                    model=self.settings.hf_embedding_model,
                    input=cleaned[:8000],
                )
                vec = list(resp.data[0].embedding)
                if len(vec) != dim:
                    # Pad / truncate to configured dim
                    if len(vec) < dim:
                        vec = vec + [0.0] * (dim - len(vec))
                    else:
                        vec = vec[:dim]
                norm = math.sqrt(sum(v * v for v in vec)) or 1.0
                return [v / norm for v in vec]
            except Exception as exc:  # noqa: BLE001
                logger.warning("HF embedding failed, using hashing fallback: %s", exc)

        return hashing_embed(cleaned, dim)

    async def extract_jsonish(self, prompt: str, system: str) -> str:
        """Helper for cron fact extraction — asks model for structured text."""
        return await self.chat(
            [
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=1500,
        )
