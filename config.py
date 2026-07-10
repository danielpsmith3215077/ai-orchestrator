"""
Application settings loaded from environment variables.

Designed for Render free-tier + free cloud APIs (Groq, Hugging Face, Supabase).
No secrets are hardcoded — copy `.env.example` to `.env` locally.
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the Autonomous Self-Evolving AI Orchestrator."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App ---
    app_name: str = "Autonomous Self-Evolving AI Orchestrator"
    app_env: str = Field(default="development", alias="APP_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    public_base_url: str = Field(
        default="http://127.0.0.1:8000",
        alias="PUBLIC_BASE_URL",
    )

    # Optional shared secret for webhook / admin endpoints
    webhook_secret: Optional[str] = Field(default=None, alias="WEBHOOK_SECRET")

    # --- LLM: Groq (OpenAI-compatible) ---
    groq_api_key: Optional[str] = Field(default=None, alias="GROQ_API_KEY")
    groq_base_url: str = Field(
        default="https://api.groq.com/openai/v1",
        alias="GROQ_BASE_URL",
    )
    groq_model: str = Field(
        default="llama-3.3-70b-versatile",
        alias="GROQ_MODEL",
    )

    # --- LLM fallback: Hugging Face Inference (OpenAI-compatible router) ---
    hf_api_token: Optional[str] = Field(default=None, alias="HF_API_TOKEN")
    hf_base_url: str = Field(
        default="https://router.huggingface.co/v1",
        alias="HF_BASE_URL",
    )
    hf_chat_model: str = Field(
        default="meta-llama/Meta-Llama-3-8B-Instruct",
        alias="HF_CHAT_MODEL",
    )
    hf_embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        alias="HF_EMBEDDING_MODEL",
    )

    # Preferred chat provider: "groq" | "huggingface" | "auto"
    llm_provider: str = Field(default="auto", alias="LLM_PROVIDER")

    # --- Vector memory: Supabase + pgvector ---
    supabase_url: Optional[str] = Field(default=None, alias="SUPABASE_URL")
    supabase_service_role_key: Optional[str] = Field(
        default=None,
        alias="SUPABASE_SERVICE_ROLE_KEY",
    )
    # Optional direct Postgres URL (preferred for pgvector RPC if set)
    database_url: Optional[str] = Field(default=None, alias="DATABASE_URL")

    # Embedding dimension for MiniLM-L6-v2 (and hashing fallback)
    embedding_dim: int = Field(default=384, alias="EMBEDDING_DIM")

    # Local SQLite fallback path when Supabase is not configured
    local_memory_path: str = Field(
        default="data/local_memory.db",
        alias="LOCAL_MEMORY_PATH",
    )

    # --- Cron / self-evolution ---
    cron_enabled: bool = Field(default=True, alias="CRON_ENABLED")
    # Cron expression: default every day at 03:00 UTC
    cron_hour_utc: int = Field(default=3, alias="CRON_HOUR_UTC")
    cron_minute_utc: int = Field(default=0, alias="CRON_MINUTE_UTC")
    # Also allow interval-based loop for free Render (hours)
    evolution_interval_hours: int = Field(default=24, alias="EVOLUTION_INTERVAL_HOURS")

    # Memory retrieval / pruning knobs (memory-conscious defaults)
    memory_top_k: int = Field(default=8, alias="MEMORY_TOP_K")
    prune_forgotten_after_days: int = Field(
        default=90,
        alias="PRUNE_FORGOTTEN_AFTER_DAYS",
    )
    min_importance_keep: float = Field(default=0.15, alias="MIN_IMPORTANCE_KEEP")

    # Web search
    web_search_enabled: bool = Field(default=True, alias="WEB_SEARCH_ENABLED")
    web_search_max_results: int = Field(default=5, alias="WEB_SEARCH_MAX_RESULTS")

    @property
    def has_groq(self) -> bool:
        return bool(self.groq_api_key and self.groq_api_key.strip())

    @property
    def has_hf(self) -> bool:
        return bool(self.hf_api_token and self.hf_api_token.strip())

    @property
    def has_llm(self) -> bool:
        return self.has_groq or self.has_hf

    @property
    def has_supabase(self) -> bool:
        return bool(
            self.supabase_url
            and self.supabase_url.strip()
            and self.supabase_service_role_key
            and self.supabase_service_role_key.strip()
        )

    @property
    def has_database_url(self) -> bool:
        return bool(self.database_url and self.database_url.strip())

    def resolved_llm_provider(self) -> str:
        """Pick an available chat provider."""
        pref = (self.llm_provider or "auto").strip().lower()
        if pref == "groq" and self.has_groq:
            return "groq"
        if pref in {"huggingface", "hf"} and self.has_hf:
            return "huggingface"
        if pref == "auto":
            if self.has_groq:
                return "groq"
            if self.has_hf:
                return "huggingface"
        if self.has_groq:
            return "groq"
        if self.has_hf:
            return "huggingface"
        return "none"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings singleton."""
    # Render injects PORT; ensure pydantic sees it.
    if "PORT" in os.environ:
        os.environ.setdefault("PORT", os.environ["PORT"])
    return Settings()


def reset_settings_cache() -> None:
    """Clear cached settings (useful in tests)."""
    get_settings.cache_clear()
