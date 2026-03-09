# Think Green Landscaping Template

This branch contains the reusable static landscaping template that powers the live Think Green demo: HTML, CSS, vanilla JS, Netlify Functions, branded emails, and the Google Sheets lead workflow.

## Source Of Truth

- GitHub repo: `https://github.com/carswqqqq1/README`
- Branch: `claude/landscaping-company-website-hl2cg`
- Live demo: `https://thinkgreen-az.netlify.app`

If production and branch ever drift, fix that before making visual or funnel edits. The branch should stay the source of truth for this template.

## What Is Part Of The Template

Core template files:

- `index.html`
- `services`
- `portfolio`
- `scottsdale-landscaping.html`
- `phoenix-landscaping.html`
- `styles.css`
- `services.css`
- `portfolio.css`
- `pages.css`
- `script.js`
- `site-config.js`
- `services-data.js`
- `projects-data.js`
- `netlify/functions/send-ticket-emails.js`
- `emails/thinkgreen-client-email.html`
- `emails/thinkgreen-owner-email.html`

This branch intentionally excludes the old unrelated Next.js app so the repo stays resale-ready and limited to the live landscaping template.

## Business Values To Update For A New Client

Edit these first:

### `site-config.js`

Update:

- `businessName`
- `shortName`
- `email`
- `phone`
- `phoneTracking`
- `address`
- `brand.logoPath`
- `googleReviews.profileUrl`
- `trustAssets.licenseVerifyUrl`
- `trustAssets.bondVerifyUrl`
- `analytics.ga4MeasurementId`

### `services-data.js`

Update:

- service headlines
- service proof blurbs
- project ranges
- service-area language
- FAQs

### `projects-data.js`

Update:

- portfolio captions
- project categories
- style reference labels

### Email templates

Update:

- `emails/thinkgreen-client-email.html`
- `emails/thinkgreen-owner-email.html`

Swap branding, links, and footer language if the business name, city, or call-to-action needs to change.

## Trust Links And Demo Safety

Do not ship fake precision.

If a client has not given you verified numbers or URLs, soften the wording instead of inventing specifics.

Examples:

- use `Highly rated by local homeowners` instead of exact review counts
- use `Arizona licensed, bonded, and insured team` instead of exact license statements if not verified

If you keep exact review, address, or ROC/license details, they must be intentional and current for that client.

## Form, Sheet, And Email Pipeline

### Frontend

The homepage form submits through:

- `/.netlify/functions/send-ticket-emails`

Prefill sources:

- homepage fit cards
- service-page consultation links
- portfolio `Request a Similar Project` actions

### Backend

Handled by:

- `netlify/functions/send-ticket-emails.js`

This function:

- normalizes ticket IDs
- normalizes budget ranges
- scores leads
- sends owner/client emails
- writes rows to Google Sheets
- suppresses placeholder values in owner-facing outputs

### Environment Variables

Set these in Netlify:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `OWNER_EMAIL`
- `GOOGLE_SHEETS_WEBHOOK_URL`
- `GOOGLE_SHEETS_WEBHOOK_SECRET` if used
- `GOOGLE_SHEET_URL`
- `CRM_WEBHOOK_URL` if used

Optional:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Local QA Checklist

Before shipping a cloned site:

1. Confirm homepage, portfolio, services hub, and all service pages use the same shell.
2. Confirm hero text is readable on desktop and mobile.
3. Submit the homepage form through the live website path.
4. Verify:
   - row appears in Google Sheets
   - owner email sends
   - client email sends
   - no `Not provided` / `Not selected` placeholders appear in sheet or email
5. Check portfolio lightbox, before/after slider, FAQ accordions, and sticky mobile CTA bar.
6. Check the client and owner emails in mobile inbox rendering.

## Deploy

Use Netlify CLI from the template folder. For the Think Green site, deploy explicitly to the correct site ID:

```bash
npx netlify deploy --prod --dir . --site=afa9fd9e-aa69-4368-a08f-d93aa497b0a8
```

## Release Checks

```bash
npm run build:assets
npm run check:js
npm run check:a11y
npm run check:site
npm run check:speed
```

## Sales + Ops Docs

- `docs/offer-sheet-template.md`
- `docs/follow-up-sequence.md`
- `docs/kpi-tracker-template.csv`
- `docs/email-deliverability.md`
- `docs/config-system.md`
- `docs/google-sheet-setup.md`
- `docs/crm-webhook-setup.md`
- `docs/client-questionnaire-template.md`
- `docs/client-answer-paste-template.md`
- `docs/client-build-prompt-template.md`
- `docs/client-config-template.json`
- `docs/white-label-handoff.md`
- `docs/accessibility-release-checklist.md`
