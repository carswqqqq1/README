#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const servicesDir = path.join(root, 'services');

const htmlFiles = fs.readdirSync(root)
  .filter((file) => file.endsWith('.html'))
  .concat(
    fs.readdirSync(servicesDir)
      .filter((file) => file.endsWith('.html'))
      .map((file) => path.join('services', file))
  );

const mainIndexedPages = [
  'index.html',
  'services.html',
  'portfolio.html',
  'resources.html',
  'scottsdale-landscaping.html',
  'phoenix-landscaping.html'
];

const failures = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

htmlFiles.forEach((file) => {
  const html = read(file);
  const manifestMatches = html.match(/rel="manifest"/g) || [];

  if (manifestMatches.length > 1) {
    failures.push(`${file}: duplicate manifest links`);
  }
  if (/https:\/\/fonts\.googleapis\.com/i.test(html)) {
    failures.push(`${file}: external Google Fonts reference found`);
  }
  if (/href="\/#contact"/i.test(html) && file !== 'index.html') {
    failures.push(`${file}: homepage contact fallback still present`);
  }
});

mainIndexedPages.forEach((file) => {
  const html = read(file);
  if (!/rel="canonical"/i.test(html)) {
    failures.push(`${file}: missing canonical link`);
  }
  if (!/application\/ld\+json/i.test(html)) {
    failures.push(`${file}: missing JSON-LD schema`);
  }
});

if (failures.length) {
  console.error('Site quality check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Site quality check passed.');
