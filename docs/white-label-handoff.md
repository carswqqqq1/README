# White-Label Handoff Guide

Use this checklist when cloning the landscaping template for a new client.

## Status Note

This template is ship-ready for live use. Any remaining work is in the "could improve later" category, such as more SEO content depth or a fuller white-label product system, not broken-site issues.

## 1. Branch + Environment

1. Create a new client branch from the current production-ready template branch.
2. Link or create a dedicated Netlify site for that client.
3. Set the client-specific environment variables before any live form testing.

## 2. Replace Client Identity

Update `site-config.js` first:

- `businessName`
- `shortName`
- `email`
- `ownerEmail`
- `phone.raw`
- `phone.display`
- `address`
- `serviceAreas`
- `brand.logoPath`
- `brand.primary`
- `brand.primaryMid`
- `brand.paper`
- `reviewRating`
- `reviewCount`
- `reviewSource`
- `reviewSourceUrl`
- `reviewSnapshotDate`
- `trustAssets`
- `locationPages`
- `socialProfiles`

Do not manually search-and-replace copy first. Update config, then sweep for any remaining branded copy.
If you have a structured client JSON file, apply it with `node scripts/apply-client-config.js path/to/client-config.json` instead of hand-editing every field.

For a cleaner handoff, generate a client launch package first:

```bash
node scripts/generate-client-package.js path/to/client-config.json
```

This creates a branch/site naming suggestion, merged config preview, Netlify env template, and launch checklist in `client-builds/<client-slug>/`.

## 3. Replace Proof Carefully

Do not invent:

- review counts
- review ratings
- license claims
- insurance/bond claims
- years in business
- service-area claims

If proof is not verified yet, mark it as pending and remove or soften the claim until it is real.

## 4. Sweep Required Files

After updating config, review these areas:

- homepage
- services hub
- all service pages
- local pages
- resources/articles
- reviews page
- about/process/free-consultation
- email templates
- `.env.example`
- `README.md`
- `llms.txt`
- `llms-full.txt`
- `sitemap.xml`

## 5. Replace Contact + Routing Defaults

Confirm:

- `OWNER_EMAIL`
- `FROM_EMAIL`
- `RESEND_FROM_EMAIL`
- `SMTP_*`
- `GOOGLE_SHEETS_*`
- `CRM_WEBHOOK_*`

No personal test emails should remain in `.env.example` or production settings.

## 6. Rebuild + QA

Run:

```bash
npm run build:assets
npm run check:js
npm run check:speed
npm run check:site
```

Then manually verify:

1. Homepage form submits.
2. Client email sends.
3. Owner email sends.
4. Sticky mobile CTA works.
5. Consultation drawer works.
6. Portfolio lightbox works.
7. FAQ toggles work.
8. Primary routes return `200`.

## 7. Final Release Check

Before handoff or launch:

- GitHub branch is current
- Netlify production matches the pushed commit
- no client-unverified trust claims remain
- no old business name, phone, email, or city residue remains
- no personal/test email values remain

This template is strongest when each new client launch is treated as a config-first clone plus a final trust-proof sweep.
