const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'carsonweso@icloud.com';
const FROM_EMAIL = process.env.FROM_EMAIL || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || '';
const EMAIL_PROVIDER = String(process.env.EMAIL_PROVIDER || 'resend').toLowerCase();
const OWNER_EMAIL_PROVIDER = String(process.env.OWNER_EMAIL_PROVIDER || 'smtp').toLowerCase();

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || '465');
const SMTP_SECURE = String(process.env.SMTP_SECURE || (SMTP_PORT === 465 ? 'true' : 'false')).toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';
const GOOGLE_SHEETS_WEBHOOK_SECRET = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || '';

const EMAIL_DIR = path.join(process.cwd(), 'emails');
const DEDUPE_WINDOW_MS = 15 * 60 * 1000;
const processedKeys = new Map();

let smtpTransporter;

function cleanupProcessedKeys(now = Date.now()) {
  for (const [key, timestamp] of processedKeys.entries()) {
    if (now - timestamp > DEDUPE_WINDOW_MS) {
      processedKeys.delete(key);
    }
  }
}

function buildDedupeKey(submission, normalized) {
  if (submission && submission.id) return `submission:${submission.id}`;
  if (submission && submission.number) return `submission-number:${submission.number}`;
  return `ticket:${normalized.ticket_id}:client:${normalized.email.toLowerCase()}`;
}

function shouldSkipDuplicate(key) {
  const now = Date.now();
  cleanupProcessedKeys(now);
  if (processedKeys.has(key)) return true;
  processedKeys.set(key, now);
  return false;
}

function readTemplate(filename) {
  const fullPath = path.join(EMAIL_DIR, filename);
  return fs.readFileSync(fullPath, 'utf8');
}

function safeText(value, fallback = 'Not provided') {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text.length ? text : fallback;
}

function cleanBudgetLabel(value) {
  const text = safeText(value, '');
  if (!text) return 'Not provided';

  // Shell-based tests can strip "$10" when values are not quoted.
  if (/^under\s*,000$/i.test(text)) return 'Under $10,000';

  return text;
}

function getPriorityClass(priorityValue) {
  const priority = safeText(priorityValue, '').toLowerCase();
  if (priority.includes('high')) return 'p-high';
  if (priority.includes('medium')) return 'p-medium';
  return 'p-low';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPlainTextFromHtml(html) {
  return String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|section|header|footer|table)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, '\'')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function formatPhoenixDate(isoString) {
  try {
    const date = isoString ? new Date(isoString) : new Date();
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Phoenix',
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  } catch {
    return safeText(isoString, 'Not provided');
  }
}

function hasSmtpCredentials() {
  return Boolean(SMTP_USER && SMTP_PASS);
}

function hasResendCredentials() {
  return Boolean(RESEND_API_KEY);
}

function isGmailAddress(fromValue) {
  return /@gmail\.com/i.test(String(fromValue || ''));
}

function getFromEmail(provider = 'auto') {
  if (provider === 'resend') {
    if (RESEND_FROM_EMAIL) return RESEND_FROM_EMAIL;
    if (FROM_EMAIL && !isGmailAddress(FROM_EMAIL)) return FROM_EMAIL;
    return 'Think Green <onboarding@resend.dev>';
  }

  if (FROM_EMAIL) return FROM_EMAIL;
  if (SMTP_USER) return `Think Green <${SMTP_USER}>`;
  return 'Think Green <no-reply@thinkgreen-az.com>';
}

function configuredProvider() {
  if (EMAIL_PROVIDER === 'smtp' || EMAIL_PROVIDER === 'resend' || EMAIL_PROVIDER === 'auto') {
    return EMAIL_PROVIDER;
  }
  return 'resend';
}

function resolveEmailProvider(preferredProvider = '') {
  const preferred = String(preferredProvider || '').toLowerCase();

  if (preferred === 'smtp') {
    if (hasSmtpCredentials()) return 'smtp';
    if (hasResendCredentials()) return 'resend';
    return 'none';
  }

  if (preferred === 'resend') {
    if (hasResendCredentials()) return 'resend';
    if (hasSmtpCredentials()) return 'smtp';
    return 'none';
  }

  const provider = configuredProvider();

  if (provider === 'auto') {
    if (hasResendCredentials()) return 'resend';
    if (hasSmtpCredentials()) return 'smtp';
    return 'none';
  }

  if (provider === 'resend') {
    if (hasResendCredentials()) return 'resend';
    if (hasSmtpCredentials()) return 'smtp';
    return 'none';
  }

  if (hasSmtpCredentials()) return 'smtp';
  if (hasResendCredentials()) return 'resend';
  return 'none';
}

function getSmtpTransporter() {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  return smtpTransporter;
}

function buildNormalizedData(rawData = {}, meta = {}) {
  const normalized = { ...rawData };

  normalized.first_name = safeText(rawData.first_name);
  normalized.last_name = safeText(rawData.last_name);
  normalized.email = safeText(rawData.email);
  normalized.phone = safeText(rawData.phone);
  normalized.project_address = safeText(rawData.project_address || rawData.property_address);
  normalized.city = safeText(rawData.city);
  normalized.service = safeText(rawData.service);

  normalized.budget = cleanBudgetLabel(rawData.budget || rawData.budget_range);
  normalized.start_timeline = safeText(rawData.start_timeline || rawData.timeline);
  normalized.preferred_contact = safeText(rawData.preferred_contact || rawData.preferred_contact_method);
  normalized.vision = safeText(rawData.vision || rawData.message);

  normalized.budget_range = normalized.budget;
  normalized.timeline = normalized.start_timeline;
  normalized.preferred_contact_method = normalized.preferred_contact;
  normalized.message = normalized.vision;

  normalized.ticket_id = safeText(rawData.ticket_id, meta.ticket_id);
  normalized.submitted_local = safeText(rawData.submitted_local, meta.submitted_local);
  normalized.owner_summary = safeText(rawData.owner_summary, meta.owner_summary);
  normalized.owner_priority = safeText(rawData.owner_priority, meta.owner_priority);
  normalized.owner_priority_class = getPriorityClass(normalized.owner_priority);
  normalized.owner_lead_score = safeText(rawData.owner_lead_score, meta.owner_lead_score);
  normalized.owner_lead_tier = safeText(rawData.owner_lead_tier, meta.owner_lead_tier);

  return normalized;
}

function buildOwnerSummary(data) {
  const pieces = [];
  pieces.push(`Service: ${safeText(data.service)}`);
  pieces.push(`Budget: ${safeText(data.budget || data.budget_range)}`);
  pieces.push(`Timeline: ${safeText(data.start_timeline || data.timeline)}`);
  pieces.push(`Contact: ${safeText(data.preferred_contact || data.preferred_contact_method)}`);
  pieces.push(`City: ${safeText(data.city)}`);
  return pieces.join(' · ');
}

function determinePriority(data) {
  const timeline = safeText(data.start_timeline || data.timeline, '').toLowerCase();
  if (timeline.includes('asap') || timeline.includes('urgent') || timeline.includes('soon')) {
    return 'High';
  }
  if (timeline.includes('next month') || timeline.includes('month') || timeline.includes('few weeks')) {
    return 'Medium';
  }
  return 'Low';
}

function determineLeadScore(data) {
  const budget = cleanBudgetLabel(data.budget || data.budget_range).toLowerCase();
  const timeline = safeText(data.start_timeline || data.timeline, '').toLowerCase();
  const service = safeText(data.service, '').toLowerCase();
  const contact = safeText(data.preferred_contact || data.preferred_contact_method, '').toLowerCase();
  const vision = safeText(data.vision || data.message, '');
  const city = safeText(data.city, '').toLowerCase();

  let score = 52;

  if (budget.includes('100,000')) score += 28;
  else if (budget.includes('50,000')) score += 22;
  else if (budget.includes('25,000')) score += 16;
  else if (budget.includes('10,000')) score += 10;
  else if (budget.includes('under')) score += 4;

  if (timeline.includes('asap')) score += 20;
  else if (timeline.includes('within 30')) score += 14;
  else if (timeline.includes('1-3')) score += 10;
  else if (timeline.includes('3-6')) score += 6;
  else if (timeline.includes('planning')) score += 2;

  if (service.includes('not sure')) score -= 4;
  else if (service) score += 6;

  if (contact.includes('phone') || contact.includes('text')) score += 4;

  if (vision.length > 120) score += 6;
  else if (vision.length > 40) score += 3;

  if (city.includes('scottsdale') || city.includes('paradise valley')) score += 4;
  else if (city) score += 2;

  return Math.max(1, Math.min(100, score));
}

function determineLeadTier(score) {
  if (score >= 78) return 'Hot';
  if (score >= 58) return 'Warm';
  return 'Nurture';
}

function fillTemplate(template, context) {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, token) => {
    const pathParts = token.split('.').map((part) => part.trim());
    let current = context;

    for (const part of pathParts) {
      if (current && Object.prototype.hasOwnProperty.call(current, part)) {
        current = current[part];
      } else {
        current = undefined;
        break;
      }
    }

    return escapeHtml(safeText(current, 'Not provided'));
  });
}

async function sendViaSmtp({ to, subject, html, replyTo }) {
  if (!hasSmtpCredentials()) {
    return { skipped: true, reason: 'missing_smtp_credentials', to };
  }

  const transporter = getSmtpTransporter();
  const text = buildPlainTextFromHtml(html);
  const info = await transporter.sendMail({
    from: getFromEmail('smtp'),
    to,
    subject,
    html,
    text,
    replyTo
  });

  return {
    provider: 'smtp',
    to,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected
  };
}

async function sendViaResend({ to, subject, html, replyTo }) {
  if (!RESEND_API_KEY) {
    return { skipped: true, reason: 'missing_resend_api_key', to };
  }

  const text = buildPlainTextFromHtml(html);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: getFromEmail('resend'),
      to,
      subject,
      html,
      text,
      reply_to: replyTo
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error: ${response.status} ${text}`);
  }

  const payload = await response.json();
  return { provider: 'resend', to, ...payload };
}

async function sendEmail(args) {
  const provider = resolveEmailProvider(args.preferredProvider);

  if (provider === 'resend') {
    try {
      return await sendViaResend(args);
    } catch (err) {
      if (hasSmtpCredentials()) {
        const smtpResult = await sendViaSmtp(args);
        return {
          ...smtpResult,
          fallback_from: 'resend',
          fallback_reason: String(err && err.message ? err.message : err)
        };
      }
      throw err;
    }
  }

  if (provider === 'smtp') {
    try {
      return await sendViaSmtp(args);
    } catch (err) {
      if (hasResendCredentials()) {
        const resendResult = await sendViaResend(args);
        return {
          ...resendResult,
          fallback_from: 'smtp',
          fallback_reason: String(err && err.message ? err.message : err)
        };
      }
      throw err;
    }
  }

  return {
    skipped: true,
    reason: 'missing_email_credentials',
    to: args.to
  };
}

async function sendToGoogleSheets(normalized, meta = {}) {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    return { skipped: true, reason: 'missing_google_sheets_webhook_url' };
  }

  const row = {
    ticket_id: normalized.ticket_id,
    submitted_local: normalized.submitted_local,
    submitted_at_iso: meta.created_at || new Date().toISOString(),
    first_name: normalized.first_name,
    last_name: normalized.last_name,
    email: normalized.email,
    phone: normalized.phone,
    project_address: normalized.project_address,
    city: normalized.city,
    service: normalized.service,
    budget_range: normalized.budget,
    timeline: normalized.start_timeline,
    preferred_contact_method: normalized.preferred_contact,
    message: normalized.vision,
    owner_priority: normalized.owner_priority,
    owner_lead_score: normalized.owner_lead_score,
    owner_lead_tier: normalized.owner_lead_tier,
    owner_summary: normalized.owner_summary,
    page_url: safeText(meta.page_url, 'Not provided')
  };

  const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: 'thinkgreen-ticket',
      secret: GOOGLE_SHEETS_WEBHOOK_SECRET || '',
      row
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Sheets webhook error: ${response.status} ${text}`);
  }

  return { ok: true };
}

function parseRequestBody(event) {
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '{}';

  return JSON.parse(rawBody || '{}');
}

exports.handler = async (event) => {
  try {
    const body = parseRequestBody(event);
    const payload = body.payload || body;
    const submission = payload.submission || payload;
    const data = submission.data || payload.data || {};

    const createdAt = submission.created_at || payload.created_at || new Date().toISOString();
    const pageUrl = payload.page_url || payload.url || submission.url || '';
    const submittedLocal = formatPhoenixDate(createdAt);
    const ticketId = data.ticket_id || `TG-${createdAt.replace(/[^0-9]/g, '').slice(0, 12)}`;
    const leadScore = determineLeadScore(data);
    const leadTier = determineLeadTier(leadScore);

    const normalized = buildNormalizedData(data, {
      ticket_id: ticketId,
      submitted_local: submittedLocal,
      owner_priority: data.owner_priority || determinePriority(data),
      owner_lead_score: String(leadScore),
      owner_lead_tier: leadTier,
      owner_summary: data.owner_summary || `${buildOwnerSummary(data)} · Lead Score: ${leadScore}/100 (${leadTier})`
    });

    const context = {
      submission: {
        data: normalized
      },
      ...normalized
    };

    const dedupeKey = buildDedupeKey(submission, normalized);
    if (shouldSkipDuplicate(dedupeKey)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          ticket_id: ticketId,
          duplicate_skipped: true
        })
      };
    }

    const ownerTemplate = readTemplate('thinkgreen-owner-email.html');
    const clientTemplate = readTemplate('thinkgreen-client-email.html');

    const ownerHtml = fillTemplate(ownerTemplate, context);
    const clientHtml = fillTemplate(clientTemplate, context);

    const ownerSubject = `Think Green Ticket ${ticketId} | ${normalized.owner_priority}`;
    const clientSubject = `Think Green - We received your project request (${ticketId})`;

    const emailTasks = [
      sendEmail({
        to: OWNER_EMAIL,
        subject: ownerSubject,
        html: ownerHtml,
        replyTo: normalized.email !== 'Not provided' ? normalized.email : undefined,
        preferredProvider: OWNER_EMAIL_PROVIDER
      })
    ];

    if (normalized.email && normalized.email !== 'Not provided') {
      emailTasks.push(
        sendEmail({
          to: normalized.email,
          subject: clientSubject,
          html: clientHtml,
          replyTo: OWNER_EMAIL
        })
      );
    }

    const [emailResults, sheetsResult] = await Promise.all([
      Promise.all(
        emailTasks.map((task) => task.catch((err) => ({
          ok: false,
          error: String(err && err.message ? err.message : err)
        })))
      ),
      sendToGoogleSheets(normalized, {
        created_at: createdAt,
        page_url: pageUrl
      }).catch((err) => ({ ok: false, error: err.message }))
    ]);

    const emailFailures = emailResults.filter((result) => result && result.ok === false);
    if (emailFailures.length === emailResults.length) {
      throw new Error(emailFailures.map((result) => result.error).join(' | '));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        ticket_id: ticketId,
        provider: emailResults.find((result) => result && result.provider)?.provider || resolveEmailProvider(),
        provider_config: configuredProvider(),
        owner_provider_preference: OWNER_EMAIL_PROVIDER,
        from_email_used: getFromEmail(resolveEmailProvider()),
        email_results: emailResults,
        sheets_result: sheetsResult
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message
      })
    };
  }
};
