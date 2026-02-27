# BrandDNA Studio (MVP+)

Pomelli-inspired workflow for agency execution: crawl a client site, build Brand DNA, generate campaigns, produce assets, run photoshoot-lite variations, and export campaign packs.

## Stack
- Next.js App Router + TypeScript + Tailwind v4
- Supabase-ready schema (with demo-mode in-memory fallback)
- Playwright + cheerio scraping pipeline
- OpenAI Responses API support with deterministic JSON + zod validation
- Optional scheduled DNA refresh cron endpoint

## Features included
- `/brands`: create and manage multiple client brands
- `/brands/[id]`: Build DNA (cached by default, rebuild with force)
- `/brands/[id]/campaigns`: 10 campaign ideas + quick goal filter
- `/brands/[id]/assets`: asset generation + quick editor controls
- `/brands/[id]/photoshoot`: upload + template variations (studio/lifestyle/flatlay)
- Export zip endpoint with JSON + CSV (`/api/brands/[id]/export`)
- Health endpoint (`/api/health`)
- Cron endpoint for periodic rebuilds (`/api/cron/rebuild-dna`)
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
CRON_SECRET=
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

## Deployment
### Option A: Vercel (recommended)
1. Import repo into Vercel.
2. Set environment variables above.
3. Add `CRON_SECRET` and keep it private.
4. Deploy.
5. Verify `/api/health` returns `{ ok: true }`.

`vercel.json` already configures a weekly cron hitting `/api/cron/rebuild-dna`.

### Option B: Docker
```bash
docker build -t branddna-studio .
docker run --rm -p 3000:3000 --env-file .env.local branddna-studio
```

## Notes
- MVP keeps runtime storage in-memory for local simplicity.
- Supabase client + schema are provided for persistence migration.
- Cron route is protected by bearer token when `CRON_SECRET` is set.
