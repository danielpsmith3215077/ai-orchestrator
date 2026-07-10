"""
FastAPI entrypoint: health, chat API, webhooks, HTML UI, evolution triggers.

Starts APScheduler background workers inside the same process for Render free tier.
"""

from __future__ import annotations

import logging
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from config import get_settings
from cron_scheduler import get_evolution_scheduler
from llm_client import LLMClient
from memory_network import MemoryNetwork
from orchestrator import Orchestrator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("main")

BASE_DIR = Path(__file__).resolve().parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=12000)
    session_id: Optional[str] = None
    force_web_search: bool = False


class WebhookPayload(BaseModel):
    message: Optional[str] = None
    text: Optional[str] = None
    session_id: Optional[str] = None
    event: Optional[str] = None
    data: Optional[dict[str, Any]] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.getLogger().setLevel(settings.log_level.upper())
    llm = LLMClient(settings)
    memory = MemoryNetwork(settings, llm)
    orch = Orchestrator(settings, llm, memory)
    evo = get_evolution_scheduler(settings, llm, memory)
    app.state.settings = settings
    app.state.llm = llm
    app.state.memory = memory
    app.state.orchestrator = orch
    app.state.evolution = evo
    evo.start()
    logger.info(
        "Started %s | llm=%s | memory=%s",
        settings.app_name,
        settings.resolved_llm_provider(),
        memory.backend,
    )
    yield
    evo.shutdown()
    logger.info("Shutdown complete")


app = FastAPI(
    title="Autonomous Self-Evolving AI Orchestrator",
    version="1.0.0",
    lifespan=lifespan,
)

static_dir = BASE_DIR / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


def _check_webhook_secret(authorization: Optional[str], x_webhook_secret: Optional[str]) -> None:
    settings = get_settings()
    expected = settings.webhook_secret
    if not expected:
        return  # open in demo mode when unset
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif x_webhook_secret:
        token = x_webhook_secret.strip()
    if not token or not secrets.compare_digest(token, expected):
        raise HTTPException(status_code=401, detail="Invalid webhook secret")


@app.get("/health")
async def health() -> dict[str, Any]:
    settings = app.state.settings
    return {
        "status": "ok",
        "app": settings.app_name,
        "env": settings.app_env,
        "llm": app.state.llm.status(),
        "memory": app.state.memory.status(),
        "evolution": app.state.evolution.status(),
    }


@app.get("/ready")
async def ready() -> JSONResponse:
    """Readiness: process is up. LLM keys optional (graceful degradation)."""
    mem = app.state.memory.status()
    body = {
        "ready": True,
        "memory_backend": mem.get("backend"),
        "llm_provider": app.state.settings.resolved_llm_provider(),
        "warnings": [],
    }
    if not app.state.llm.available:
        body["warnings"].append("No GROQ_API_KEY or HF_API_TOKEN — chat will store memory only.")
    if not app.state.settings.has_supabase:
        body["warnings"].append("Supabase not configured — using local SQLite memory.")
    return JSONResponse(body)


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "app_name": app.state.settings.app_name,
            "provider": app.state.settings.resolved_llm_provider(),
            "memory_backend": app.state.memory.backend,
        },
    )


@app.post("/api/chat")
async def api_chat(body: ChatRequest) -> dict[str, Any]:
    result = await app.state.orchestrator.handle(
        body.message,
        session_id=body.session_id,
        force_web_search=body.force_web_search,
    )
    return result.to_dict()


@app.post("/webhook")
async def webhook(
    payload: WebhookPayload,
    authorization: Optional[str] = Header(default=None),
    x_webhook_secret: Optional[str] = Header(default=None, alias="X-Webhook-Secret"),
) -> dict[str, Any]:
    _check_webhook_secret(authorization, x_webhook_secret)
    if payload.event == "evolve":
        result = await app.state.evolution.run_evolution_cycle()
        return {"ok": True, "evolution": result}
    message = (payload.message or payload.text or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="message or text required")
    result = await app.state.orchestrator.handle(message, session_id=payload.session_id)
    return {"ok": True, "result": result.to_dict()}


@app.post("/admin/evolve")
async def admin_evolve(
    authorization: Optional[str] = Header(default=None),
    x_webhook_secret: Optional[str] = Header(default=None, alias="X-Webhook-Secret"),
) -> dict[str, Any]:
    """Manual / Render Cron trigger for the 24h self-learning loop."""
    _check_webhook_secret(authorization, x_webhook_secret)
    result = await app.state.evolution.run_evolution_cycle()
    return {"ok": True, "evolution": result}


@app.get("/api/status")
async def api_status() -> dict[str, Any]:
    return {
        "orchestrator": app.state.orchestrator.status(),
        "evolution": app.state.evolution.status(),
        "health": "ok",
    }


@app.get("/api/lessons")
async def api_lessons() -> dict[str, Any]:
    lessons = await app.state.memory.list_active_lessons(limit=50)
    return {"lessons": lessons}


if __name__ == "__main__":
    import uvicorn

    s = get_settings()
    uvicorn.run("main:app", host=s.host, port=s.port, reload=False)
