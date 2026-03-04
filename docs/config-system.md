# Config-Driven Template System

All client-specific website data is centralized in `site-config.js`.

## Edit Once, Update Everywhere

Update these fields for each new client:
- `businessName`, `shortName`
- `phone.raw`, `phone.display`
- `email`
- `address.line1`, `city`, `state`, `zip`
- `brand.logoPath`, `brand.primary`, `brand.primaryMid`, `brand.paper`
- `contactFormServices`
- `projectFit`
- `beforeAfter`
- `reviews`
- `analytics.ga4MeasurementId`

## What Updates Automatically

`script.js` applies config values to:
- Phone links/displays
- Email links/displays
- Address fields
- Logo references (`data-site-logo`)
- Year + business name in footer
- Contact form service dropdown
- Project-fit cards
- Before/after slider media + note
- Reviews cards
- GA4 events (`call_click`, `form_submit`)

## Clone Workflow

1. Duplicate this project.
2. Edit only `site-config.js`.
3. Set Netlify env vars for email routing.
4. Deploy.
