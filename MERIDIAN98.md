# Meridian98 marketing website

The **Meridian98** site is **not** the Python FastAPI app at the repository root.

**Standalone project — deploy as its own Vercel project; do not combine with the orchestrator or other apps.**

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

## Deploy to Vercel (production)

The site builds with `npm run build` → `dist/`. Config: [`meridian98-website/vercel.json`](./meridian98-website/vercel.json) (Vite + SPA rewrite to `index.html` for hash routes).

### Fastest path: connect GitHub in the Vercel dashboard (~2 minutes)

1. Open [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import **`danielpsmith3215077/ai-orchestrator`**.
3. Set **Root Directory** to `meridian98-website` (important — do not leave repo root).
4. Framework: Vite · Build: `npm run build` · Output: `dist` (usually auto-detected from `vercel.json`).
5. Deploy. Production URL will look like `https://ai-orchestrator-….vercel.app` (or your custom domain).
6. Optional: under Project → Settings → Git, set the Production Branch to `cursor/meridian98-website-270c` until you merge PR [#1](https://github.com/danielpsmith3215077/ai-orchestrator/pull/1).

### Claim the latest temporary preview (expires ~60 min after deploy)

A CLI anonymous deploy may already be up. Claim it into your Vercel account so it does not expire:

- Preview: see the latest agent comment / PR notes for the live URL
- Claim: open the claim link from that deploy message on [vercel.com/claim-deployment](https://vercel.com/claim-deployment)

### CLI (needs `VERCEL_TOKEN`)

```bash
cd meridian98-website
npx vercel --prod --yes --token "$VERCEL_TOKEN"
```

Or link once: `npx vercel link` (Root Directory = `meridian98-website`), then `npx vercel --prod`.
