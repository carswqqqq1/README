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
 *
 * Optional: run setup() once to print the created spreadsheet URL.
 */
const SHEET_NAME = 'Leads';
const SPREADSHEET_TITLE = 'Think Green Leads';
const TARGET_SPREADSHEET_ID = ''; // Optional: set to an existing sheet ID
const WEBHOOK_SECRET = 'replace-with-long-random-secret';
const SPREADSHEET_ID_KEY = 'THINKGREEN_SPREADSHEET_ID';

function setup() {
  const meta = getOrCreateSheet_();
  Logger.log('Spreadsheet URL: ' + meta.spreadsheet.getUrl());
}

function doGet() {
  const meta = getOrCreateSheet_();
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    spreadsheet_id: meta.spreadsheet.getId(),
    spreadsheet_url: meta.spreadsheet.getUrl(),
    sheet_name: SHEET_NAME
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const secret = body.secret || '';

    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    const row = body.row || {};
    const meta = getOrCreateSheet_();

    meta.sheet.appendRow([
      row.ticket_id || '',
      row.submitted_local || '',
      row.submitted_at_iso || '',
      row.first_name || '',
      row.last_name || '',
      row.email || '',
      row.phone || '',
      row.project_address || '',
      row.city || '',
      row.service || '',
      row.budget_range || '',
      row.timeline || '',
      row.preferred_contact_method || '',
      row.message || '',
      row.owner_priority || '',
      row.owner_summary || '',
      row.page_url || ''
    ]);

    return json_({
      ok: true,
      spreadsheet_id: meta.spreadsheet.getId(),
      spreadsheet_url: meta.spreadsheet.getUrl(),
      sheet_name: SHEET_NAME
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
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

  sheet.appendRow([
    'ticket_id',
    'submitted_local',
    'submitted_at_iso',
    'first_name',
    'last_name',
    'email',
    'phone',
    'project_address',
    'city',
    'service',
    'budget_range',
    'timeline',
    'preferred_contact_method',
    'message',
    'owner_priority',
    'owner_summary',
    'page_url'
  ]);
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
