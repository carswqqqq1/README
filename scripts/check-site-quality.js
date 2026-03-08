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
const envExamplePath = path.join(root, '.env.example');

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
  if (/href="\/#reviews"/i.test(html)) {
    failures.push(`${file}: homepage reviews anchor fallback still present`);
  }
  if (/href="\/#contact"/i.test(html) && file !== 'index.html') {
    failures.push(`${file}: homepage contact fallback still present`);
  }
  if (file === 'index.html' && /<script src="\/site-config\.js"(?![^>]*defer)/i.test(html)) {
    failures.push(`${file}: site-config.js is not deferred`);
  }
  if (file === 'index.html' && /<script src="\/script\.min\.js"(?![^>]*defer)/i.test(html)) {
    failures.push(`${file}: script.min.js is not deferred`);
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

if (fs.existsSync(envExamplePath)) {
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  if (/carsonweso@icloud\.com|carson\.elevatemarketing@gmail\.com/i.test(envExample)) {
    failures.push('.env.example: personal email fallback found');
  }
}

if (failures.length) {
  console.error('Site quality check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Site quality check passed.');
