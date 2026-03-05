/**
 * Think Green lead webhook for Google Sheets.
 *
 * Deploy this script as a Web App:
 * 1) https://script.new
 * 2) Paste this file.
 * 3) Set WEBHOOK_SECRET below.
 * 4) Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5) Copy the Web app URL to Netlify env var GOOGLE_SHEETS_WEBHOOK_URL.
 */
const SHEET_NAME = 'Leads';
const SPREADSHEET_TITLE = 'Think Green Leads';
const TARGET_SPREADSHEET_ID = ''; // Optional: set to existing sheet ID
const WEBHOOK_SECRET = 'replace-with-long-random-secret';
const SPREADSHEET_ID_KEY = 'THINKGREEN_SPREADSHEET_ID';
const DEDUPE_WINDOW_DAYS = 7;

const HEADERS = [
  'timestamp',
  'ticket_id',
  'name',
  'first_name',
  'last_name',
  'email',
  'phone',
  'project_location',
  'project_address',
  'city',
  'service',
  'selected_service',
  'consultation_tier',
  'budget_range',
  'start_timeline',
  'estimated_timeline',
  'contact_method',
  'lead_source',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'referrer',
  'landing_path',
  'page_url',
  'lead_score',
  'lead_tier',
  'lead_tags',
  'status',
  'follow_up_due',
  'last_touched',
  'next_action',
  'assigned_to',
  'notes',
  'owner_priority',
  'owner_summary'
];

function setup() {
  const meta = getOrCreateSheet_();
  Logger.log('Spreadsheet URL: ' + meta.spreadsheet.getUrl());
}

function doGet() {
  const meta = getOrCreateSheet_();
  return json_({
    ok: true,
    spreadsheet_id: meta.spreadsheet.getId(),
    spreadsheet_url: meta.spreadsheet.getUrl(),
    sheet_name: SHEET_NAME
  });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const secret = String(body.secret || '').trim();

    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    const row = body.row || {};
    const meta = getOrCreateSheet_();
    const now = new Date();
    const normalizedEmail = normalizeEmail_(row.email || '');
    const normalizedPhone = normalizePhone_(row.phone || '');

    const duplicate = findRecentDuplicate_(meta.sheet, normalizedEmail, normalizedPhone, now);
    const status = duplicate ? 'Duplicate' : (String(row.status || '').trim() || 'New');
    const followUpDue = status === 'New' ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : '';
    const nextAction = status === 'New' ? 'Call' : '';

    const tags = normalizeTags_(row.lead_tags || row.owner_lead_tags || '');
    if (duplicate && tags.indexOf('duplicate') === -1) tags.push('duplicate');

    const values = {
      timestamp: row.timestamp || now.toISOString(),
      ticket_id: row.ticket_id || '',
      name: row.name || [row.first_name || '', row.last_name || ''].join(' ').trim(),
      first_name: row.first_name || '',
      last_name: row.last_name || '',
      email: row.email || '',
      phone: row.phone || '',
      project_location: row.project_location || '',
      project_address: row.project_address || '',
      city: row.city || '',
      service: row.service || '',
      selected_service: row.selected_service || '',
      consultation_tier: row.consultation_tier || row.lead_tier || '',
      budget_range: row.budget_range || '',
      start_timeline: row.start_timeline || row.timeline || '',
      estimated_timeline: row.estimated_timeline || '',
      contact_method: row.contact_method || row.preferred_contact_method || '',
      lead_source: row.lead_source || '',
      utm_source: row.utm_source || '',
      utm_medium: row.utm_medium || '',
      utm_campaign: row.utm_campaign || '',
      utm_content: row.utm_content || '',
      referrer: row.referrer || '',
      landing_path: row.landing_path || '',
      page_url: row.page_url || '',
      lead_score: row.lead_score || row.owner_lead_score || '',
      lead_tier: row.lead_tier || row.owner_lead_tier || '',
      lead_tags: tags.join(', '),
      status: status,
      follow_up_due: followUpDue,
      last_touched: now,
      next_action: row.next_action || nextAction,
      assigned_to: row.assigned_to || '',
      notes: row.notes || '',
      owner_priority: row.owner_priority || '',
      owner_summary: row.owner_summary || ''
    };

    meta.sheet.appendRow(HEADERS.map(function (key) { return values[key]; }));

    const rowId = meta.sheet.getLastRow();
    const rowUrl = buildRowUrl_(meta.spreadsheet, meta.sheet, rowId);

    return json_({
      ok: true,
      row_id: rowId,
      row_url: rowUrl,
      status: status,
      spreadsheet_id: meta.spreadsheet.getId(),
      spreadsheet_url: meta.spreadsheet.getUrl(),
      sheet_name: SHEET_NAME
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (sheet.getName() !== SHEET_NAME) return;

    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const statusCol = header.indexOf('status') + 1;
    const lastTouchedCol = header.indexOf('last_touched') + 1;
    if (!statusCol || !lastTouchedCol) return;

    if (e.range.getColumn() === statusCol && e.range.getRow() > 1) {
      sheet.getRange(e.range.getRow(), lastTouchedCol).setValue(new Date());
    }
  } catch (err) {
    Logger.log('onEdit error: ' + err);
  }
}

function findRecentDuplicate_(sheet, email, phone, now) {
  if (!email && !phone) return false;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

  const tsIndex = header.indexOf('timestamp');
  const emailIndex = header.indexOf('email');
  const phoneIndex = header.indexOf('phone');
  if (tsIndex < 0 || emailIndex < 0 || phoneIndex < 0) return false;

  const cutoff = new Date(now.getTime() - DEDUPE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const existingTsRaw = rows[i][tsIndex];
    const existingTs = existingTsRaw ? new Date(existingTsRaw) : null;
    if (!existingTs || isNaN(existingTs.getTime()) || existingTs < cutoff) continue;

    const existingEmail = normalizeEmail_(rows[i][emailIndex]);
    const existingPhone = normalizePhone_(rows[i][phoneIndex]);

    if ((email && existingEmail && email === existingEmail) || (phone && existingPhone && phone === existingPhone)) {
      return true;
    }
  }

  return false;
}

function normalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone_(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeTags_(value) {
  const text = String(value || '').trim();
  if (!text) return [];
  return text
    .split(',')
    .map(function (tag) { return String(tag || '').trim(); })
    .filter(Boolean);
}

function buildRowUrl_(spreadsheet, sheet, row) {
  return spreadsheet.getUrl() + '#gid=' + sheet.getSheetId() + '&range=A' + row;
}

function getOrCreateSheet_() {
  const props = PropertiesService.getScriptProperties();
  let spreadsheetId = TARGET_SPREADSHEET_ID || props.getProperty(SPREADSHEET_ID_KEY);
  let spreadsheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  } else {
    spreadsheet = SpreadsheetApp.create(SPREADSHEET_TITLE);
    spreadsheetId = spreadsheet.getId();
    props.setProperty(SPREADSHEET_ID_KEY, spreadsheetId);
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  ensureHeader_(sheet);

  return { spreadsheet, sheet };
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(HEADERS);
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
