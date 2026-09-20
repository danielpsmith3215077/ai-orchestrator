# Meridian98 Website

Premium cinematic single-page marketing site + private hash-routed dashboard for **Meridian98** (B2B / SaaS consulting).

## Stack

- React + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Hash router for `#/dashboard` (password-gated)

## Run locally (Mac)

You must run the **Vite dev server** for this folder. The parent `ai-orchestrator` repo is a Python FastAPI app on a different port; it does **not** serve this site.

### 1. Get the branch

```bash
cd path/to/ai-orchestrator
git fetch origin
git checkout cursor/meridian98-website-270c
```

### 2. Install and start dev (keep terminal open)

```bash
cd meridian98-website

node -v    # Node.js 18+ required (20+ recommended)
npm install
npm run dev
```

**Do not close the terminal** while using the site. When Vite exits or you press Ctrl+C, **http://127.0.0.1:5173** will show `ERR_CONNECTION_REFUSED`.

Open **http://127.0.0.1:5173** in your browser (Vite binds to `127.0.0.1:5173`).

From the **repository root** instead:

```bash
npm run dev:meridian98
```

**Production build check:**

```bash
npm run build
npm run preview   # serves dist/ at http://127.0.0.1:4173
```

### Common mistakes

| Symptom | Fix |
|--------|-----|
| `ERR_CONNECTION_REFUSED` on 127.0.0.1:5173 | Run `npm run dev` in `meridian98-website/` and **keep that terminal open**. |
| `ENOENT: no such file or directory, open '.../package.json'` | You are in the repo root. `cd meridian98-website` first, or use `npm run dev:meridian98` from root. |
| `npm: command not found` | Install Node from [nodejs.org](https://nodejs.org/) or `brew install node`. |
| Port 5173 already in use | Stop the other process or run `npm run dev -- --port 5174` and open that port. |
| Blank page at `localhost:8000` | That is the Python orchestrator, not this site. Use **5173**. |

See also [MERIDIAN98.md](../MERIDIAN98.md) at the repo root.

## Dashboard access

- Route: `/#/dashboard`
- Password: `VITE_DASHBOARD_PASSWORD` (see `.env.example`)
- Fallback for local demos: `meridianAdmin98`

Optional setup:

```bash
cp .env.example .env
```

## Scripts

```bash
npm run dev      # vite --host 127.0.0.1 --port 5173
npm run build
npm run preview
npm run lint
```

## Notes

- Public marketing content lives on `/` with smooth-scroll anchors.
- `robots.txt` and the `#seo-crawler-policy` meta tag keep the dashboard out of indexes.
- This project is standalone and does not modify the FastAPI orchestrator at the repository root.
