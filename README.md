# Local Service Website Template (Netlify)

This branch contains a conversion-focused local-service template (static HTML/CSS/JS + Netlify Function email pipeline).

## Repo + Branch

- GitHub: `https://github.com/carswqqqq1/README`
- Branch: `claude/landscaping-company-website-hl2cg`

## Core Files

- `index.html`, `portfolio.html`
- `styles.css`, `portfolio.css`, `script.js`
- `site-config.js` (single-source business data)
- `netlify/functions/send-ticket-emails.js`
- `emails/thinkgreen-client-email.html`, `emails/thinkgreen-owner-email.html`

## Clone + Configure

1. Clone and checkout branch:
   ```bash
   git clone https://github.com/carswqqqq1/README
   cd README
   git checkout claude/landscaping-company-website-hl2cg
   ```
2. Update `site-config.js` for the new client:
   - business name, phone, email, address
   - logo path and brand colors
   - contact form services
   - project fit cards
   - reviews
   - GA4 measurement ID
3. Copy env vars:
   ```bash
   cp .env.example .env
   ```
4. Configure email env vars in Netlify site settings.

## Deploy

Use Netlify CLI from this folder:

```bash
npx netlify deploy --prod --dir .
```

## Sales + Ops Docs

- `docs/offer-sheet-template.md`
- `docs/follow-up-sequence.md`
- `docs/kpi-tracker-template.csv`
- `docs/email-deliverability.md`
- `docs/config-system.md`
