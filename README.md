# BrandDNA Studio (MVP)

Pomelli-inspired workflow for agency execution: crawl a client site, build Brand DNA, generate campaigns, produce assets, run photoshoot-lite variations, and export campaign packs.

## Stack
- Next.js App Router + TypeScript + Tailwind v4
- Supabase-ready schema (with demo-mode in-memory fallback)
- Playwright + cheerio scraping pipeline
- OpenAI Responses API support with deterministic JSON + zod validation

## Features included
- `/brands`: create and manage multiple client brands
- `/brands/[id]`: Build DNA (cached; use rebuild to refresh)
- `/brands/[id]/campaigns`: 10 campaign ideas + quick goal filter
- `/brands/[id]/assets`: asset generation + quick editor controls
- `/brands/[id]/photoshoot`: upload + template variations (studio/lifestyle/flatlay)
- Export zip endpoint with JSON + CSV (`/api/brands/[id]/export`)
- Demo mode (no API keys required)

## Local setup
```bash
npm install
npm run dev
```
Open `http://localhost:3000/brands`.

## Environment variables
Copy `.env.example` to `.env.local`.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

If env vars are missing, app runs in **demo mode** with sample brands + deterministic placeholders.

## Supabase
- Schema: `supabase/schema.sql`
- Seeds: `supabase/seeds.sql`

Apply via Supabase SQL editor or CLI.

## Scraping + DNA pipeline
1. Try Playwright on homepage.
2. Fallback to fetch+cheerio if browser fails.
3. Discover internal links (About/Services/Pricing/Contact).
4. Extract CSS colors/fonts + copy text.
5. Infer tone/voice/offers/visual style via OpenAI (or fallback seed).
6. Validate with zod and auto-retry once with fix prompt.

## Notes
- MVP keeps runtime storage in-memory for local simplicity.
- Supabase client + schema are provided for persistence migration.
- Background jobs can be added via cron or Inngest on top of API routes.
