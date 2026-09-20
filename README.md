# Autonomous Self-Evolving AI Orchestrator

Cloud-hosted cognitive orchestrator with a **vector memory graph**, **DuckDuckGo search**, **Groq / Hugging Face LLMs**, and a **24-hour self-evolution loop** (consolidation → fact extraction → synaptic pruning → self-correction).

- **100% cloud** — no laptop Ollama dependency
- **Render free-tier friendly** — single Docker process with in-process APScheduler
- **Graceful degradation** — works with SQLite memory if Supabase is unset; stores messages even if LLM keys are missing

## Project layout

| File | Role |
|------|------|
| `main.py` | FastAPI: UI, `/api/chat`, webhooks, health, evolve trigger |
| `orchestrator.py` | Cognitive router: retrieve → search → generate → encode |
| `memory_network.py` | Supabase pgvector (or SQLite) memory graph |
| `cron_scheduler.py` | APScheduler 24h evolution pipeline |
| `llm_client.py` | Groq / HF OpenAI-compatible clients + hashing embed fallback |
| `config.py` | Env-driven settings |
| `sql/001_pgvector_schema.sql` | Supabase schema + `match_memory_nodes` RPC |
| `Dockerfile` | Multi-stage, memory-safe image |
| `render.yaml` | Render blueprint |
| `meridian98-website/` | Meridian98 marketing site (Vite + React) — see [MERIDIAN98.md](./MERIDIAN98.md) |

## Quick start (local)

```bash
cd /Users/danielsmith/ai-orchestrator
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edit .env — at minimum set GROQ_API_KEY
uvicorn main:app --host 0.0.0.0 --port 8000
```

Open http://127.0.0.1:8000

### Free API keys

1. **Groq** (chat): https://console.groq.com → API Keys → `GROQ_API_KEY`
2. **Hugging Face** (optional chat/embeddings): https://huggingface.co/settings/tokens → `HF_API_TOKEN`
3. **Supabase** (cloud pgvector):
   - Create a project at https://supabase.com
   - SQL Editor → paste & run `sql/001_pgvector_schema.sql`
   - Project Settings → API → copy URL + **service_role** key
   - Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

Without Supabase, the app uses `data/local_memory.db` automatically.

## Deploy on Render (new service)

1. Push this repo to a **new** GitHub repository (do not overwrite other repos).
2. Render Dashboard → **New → Web Service** → connect the repo.
3. Runtime: **Docker** (uses `Dockerfile`).
4. Plan: **Free**.
5. Set environment variables (see `.env.example`):
   - Required for chat: `GROQ_API_KEY` (or `HF_API_TOKEN`)
   - Recommended: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - Recommended: `WEBHOOK_SECRET`, `PUBLIC_BASE_URL`
6. Health check path: `/health`
7. Deploy. APScheduler starts inside the web process automatically.

### Cron options

**Primary (included):** in-process APScheduler every `EVOLUTION_INTERVAL_HOURS` (default 24) plus daily UTC cron.

**Optional external:** hit `POST /admin/evolve` with header `X-Webhook-Secret: $WEBHOOK_SECRET` from Render Cron or any scheduler (`render.yaml` includes an optional cron service stub).

## API

- `GET /` — chat UI
- `GET /health` — liveness + component status
- `GET /ready` — readiness + warnings
- `POST /api/chat` — `{ "message": "...", "session_id": optional, "force_web_search": false }`
- `POST /webhook` — same chat, or `{ "event": "evolve" }`
- `POST /admin/evolve` — run self-learning cycle now
- `GET /api/lessons` — active core lessons
- `GET /api/status` — orchestrator + scheduler status

## Architecture

```
User → FastAPI → Orchestrator
                 ├─ MemoryNetwork.semantic_search (pgvector / SQLite)
                 ├─ DuckDuckGo (if needed)
                 ├─ Groq / Hugging Face chat
                 └─ encode interaction + tool results

Every 24h → EvolutionScheduler
  Consolidation → Fact Extraction → Prune/Reweight → Self-Correction lessons
```

## License

Use and adapt freely for your own deployments.
