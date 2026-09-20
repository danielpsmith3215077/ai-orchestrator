# Meridian98 marketing website

The **Meridian98** site is **not** the Python FastAPI app at the repository root.

It lives in:

```text
meridian98-website/
```

## Run locally (Mac)

`ERR_CONNECTION_REFUSED` on **http://127.0.0.1:5173** means the Vite dev server is **not running**. Start it and **leave that terminal window open** while you browse.

From your clone of this repo:

```bash
git fetch origin
git checkout cursor/meridian98-website-270c

cd meridian98-website
node -v   # Node.js 18+ (20+ recommended)
npm install
npm run dev
```

Keep the terminal running. You should see Vite ready at **http://127.0.0.1:5173/** — then open that URL in your browser.

**From the repo root** (same result):

```bash
git fetch origin
git checkout cursor/meridian98-website-270c
npm run dev:meridian98
```

Optional dashboard env (not required for the homepage):

```bash
cd meridian98-website
cp .env.example .env
```

Full details: [meridian98-website/README.md](./meridian98-website/README.md)
