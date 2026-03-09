#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const configPath = path.join(root, 'site-config.js');

function loadSiteConfig() {
  delete require.cache[require.resolve(configPath)];
  return require(configPath);
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function merge(target, source) {
  const output = Array.isArray(target) ? target.slice() : { ...target };
  Object.keys(source || {}).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];

    if (Array.isArray(sourceValue)) {
      output[key] = sourceValue;
      return;
    }

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key] = merge(targetValue, sourceValue);
      return;
    }

    output[key] = sourceValue;
  });

  return output;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function validate(config) {
  const required = [
    ['businessName', config.businessName],
    ['shortName', config.shortName],
    ['email', config.email],
    ['ownerEmail', config.ownerEmail],
    ['phone.raw', config.phone && config.phone.raw],
    ['phone.display', config.phone && config.phone.display],
    ['address.line1', config.address && config.address.line1],
    ['address.city', config.address && config.address.city],
    ['address.state', config.address && config.address.state],
    ['address.zip', config.address && config.address.zip],
    ['serviceAreas', Array.isArray(config.serviceAreas) && config.serviceAreas.length],
    ['reviewRating', config.reviewRating],
    ['reviewCount', config.reviewCount],
    ['reviewSource', config.reviewSource],
    ['reviewSourceUrl', config.reviewSourceUrl],
    ['reviewSnapshotDate', config.reviewSnapshotDate]
  ];

  const missing = required
    .filter((entry) => !String(entry[1] || '').trim())
    .map((entry) => entry[0]);

  if (missing.length) {
    throw new Error(`Missing required config fields: ${missing.join(', ')}`);
  }
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/generate-client-package.js <path-to-client-config.json> [output-dir]');
  process.exit(1);
}

const absoluteInputPath = path.isAbsolute(inputPath) ? inputPath : path.join(root, inputPath);
const outputRoot = process.argv[3]
  ? (path.isAbsolute(process.argv[3]) ? process.argv[3] : path.join(root, process.argv[3]))
  : path.join(root, 'client-builds');

const incoming = JSON.parse(fs.readFileSync(absoluteInputPath, 'utf8'));
const mergedConfig = merge(loadSiteConfig(), incoming);
validate(mergedConfig);

const slug = slugify(mergedConfig.shortName || mergedConfig.businessName || 'client-site');
const buildDir = path.join(outputRoot, slug);
const branchName = `codex/${slug}-site`;
const netlifySite = `${slug}-site`;

const summary = `# ${mergedConfig.businessName} Launch Package

Generated on ${new Date().toISOString().slice(0, 10)} from ${absoluteInputPath}

## Suggested Branch
- ${branchName}

## Suggested Netlify Site
- ${netlifySite}

## Client Snapshot
- Business name: ${mergedConfig.businessName}
- Short name: ${mergedConfig.shortName}
- Phone: ${mergedConfig.phone.display}
- Email: ${mergedConfig.email}
- Address: ${mergedConfig.address.line1}, ${mergedConfig.address.city}, ${mergedConfig.address.state} ${mergedConfig.address.zip}
- Service areas: ${mergedConfig.serviceAreas.join(', ')}
- Reviews: ${mergedConfig.reviewRating} stars across ${mergedConfig.reviewCount} reviews on ${mergedConfig.reviewSource}
- Review snapshot: ${mergedConfig.reviewSnapshotDate}

## Recommended Workflow
1. Create branch \`${branchName}\`.
2. Run \`node scripts/apply-client-config.js ${absoluteInputPath}\`.
3. Update review URLs, license verification URLs, and social profiles if needed.
4. Run \`npm run build:assets\`.
5. Run all release checks.
6. Link or create Netlify site \`${netlifySite}\`.
7. Deploy and do the manual accessibility checklist before final launch.
`;

const envTemplate = `NETLIFY_AUTH_TOKEN=
EMAIL_TO=${mergedConfig.ownerEmail}
EMAIL_FROM=${mergedConfig.email}
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
GOOGLE_SHEETS_WEBHOOK_URL=
`;

const checklist = `# ${mergedConfig.shortName} Release Checklist

- [ ] Apply client config
- [ ] Replace logo assets if needed
- [ ] Confirm license, bond, and insurance proof
- [ ] Confirm review rating, count, and review source URL
- [ ] Confirm all service areas and location pages
- [ ] Build minified assets
- [ ] Run:
  - npm run check:js
  - npm run check:a11y
  - npm run check:site
  - npm run check:speed
- [ ] Run manual accessibility/device audit
- [ ] Deploy to Netlify
- [ ] Verify production routes and lead flow
`;

writeFile(path.join(buildDir, 'client-summary.md'), summary);
writeFile(path.join(buildDir, 'netlify-env-template.txt'), envTemplate);
writeFile(path.join(buildDir, 'launch-checklist.md'), checklist);
writeFile(path.join(buildDir, 'merged-site-config-preview.json'), `${JSON.stringify(mergedConfig, null, 2)}\n`);

console.log(`Generated client package in ${buildDir}`);
