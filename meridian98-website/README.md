# Meridian98 Website

Premium cinematic single-page marketing site + private hash-routed dashboard for **Meridian98** (B2B / SaaS consulting).

## Stack

- React + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Hash router for `#/dashboard` (password-gated)

## Setup

```bash
cd meridian98-website
npm install
cp .env.example .env
npm run dev
```

## Dashboard access

- Route: `/#/dashboard`
- Password: `VITE_DASHBOARD_PASSWORD` (see `.env.example`)
- Fallback for local demos: `meridianAdmin98`

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Notes

- Public marketing content lives on `/` with smooth-scroll anchors.
- `robots.txt` and the `#seo-crawler-policy` meta tag keep the dashboard out of indexes.
- This project is standalone and does not modify the FastAPI orchestrator at the repository root.
