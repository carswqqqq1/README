import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.resolve('./data/ads.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      page_id TEXT,
      library_url TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'DTC',
      logo_url TEXT,
      last_scraped_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      ad_archive_id TEXT UNIQUE,
      title TEXT,
      body TEXT,
      cta_text TEXT,
      cta_link TEXT,
      media_type TEXT CHECK(media_type IN ('image','video','carousel','unknown')),
      media_url TEXT,
      thumbnail_url TEXT,
      impressions_lower INTEGER,
      impressions_upper INTEGER,
      spend_lower INTEGER,
      spend_upper INTEGER,
      currency TEXT DEFAULT 'USD',
      started_at TEXT,
      ended_at TEXT,
      is_active INTEGER DEFAULT 1,
      raw_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ad_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
      asset_type TEXT,
      visual_format TEXT,
      messaging_angle TEXT,
      hook_tactic TEXT,
      offer_type TEXT,
      summary TEXT,
      tags TEXT,
      analyzed_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE UNIQUE,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_ads_brand_id ON ads(brand_id);
    CREATE INDEX IF NOT EXISTS idx_ads_media_type ON ads(media_type);
    CREATE INDEX IF NOT EXISTS idx_ads_impressions ON ads(impressions_lower DESC);
    CREATE INDEX IF NOT EXISTS idx_ad_analyses_ad_id ON ad_analyses(ad_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_ad_id ON bookmarks(ad_id);
  `);
}

// ─── Brand helpers ────────────────────────────────────────────────────────────

export function getAllBrands() {
  const db = getDb();
  return db.prepare(`
    SELECT b.*, COUNT(a.id) as ad_count
    FROM brands b
    LEFT JOIN ads a ON a.brand_id = b.id
    GROUP BY b.id
    ORDER BY b.name ASC
  `).all();
}

export function getBrandById(id: number) {
  return getDb().prepare('SELECT * FROM brands WHERE id = ?').get(id);
}

export function insertBrand(data: {
  name: string;
  library_url: string;
  page_id?: string;
  category?: string;
  logo_url?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO brands (name, library_url, page_id, category, logo_url)
    VALUES (@name, @library_url, @page_id, @category, @logo_url)
  `);
  return stmt.run(data);
}

export function updateBrandScrapedAt(id: number) {
  getDb().prepare(`UPDATE brands SET last_scraped_at = datetime('now') WHERE id = ?`).run(id);
}

// ─── Ad helpers ───────────────────────────────────────────────────────────────

export function getAds(filters: {
  brand_id?: number;
  media_type?: string;
  bookmarked?: boolean;
  search?: string;
  tags?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.brand_id) {
    conditions.push('a.brand_id = @brand_id');
    params.brand_id = filters.brand_id;
  }
  if (filters.media_type) {
    conditions.push('a.media_type = @media_type');
    params.media_type = filters.media_type;
  }
  if (filters.bookmarked) {
    conditions.push('bk.id IS NOT NULL');
  }
  if (filters.search) {
    conditions.push('(a.title LIKE @search OR a.body LIKE @search)');
    params.search = `%${filters.search}%`;
  }
  if (filters.tags) {
    conditions.push("an.tags LIKE @tags");
    params.tags = `%${filters.tags}%`;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  return db.prepare(`
    SELECT
      a.*,
      b.name as brand_name,
      b.category as brand_category,
      b.logo_url as brand_logo,
      an.asset_type, an.visual_format, an.messaging_angle, an.hook_tactic,
      an.offer_type, an.summary, an.tags as ai_tags, an.analyzed_at,
      CASE WHEN bk.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked
    FROM ads a
    JOIN brands b ON b.id = a.brand_id
    LEFT JOIN ad_analyses an ON an.ad_id = a.id
    LEFT JOIN bookmarks bk ON bk.ad_id = a.id
    ${where}
    ORDER BY a.impressions_lower DESC NULLS LAST, a.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `).all(params);
}

export function getAdById(id: number) {
  const db = getDb();
  return db.prepare(`
    SELECT
      a.*,
      b.name as brand_name,
      b.category as brand_category,
      b.logo_url as brand_logo,
      an.asset_type, an.visual_format, an.messaging_angle, an.hook_tactic,
      an.offer_type, an.summary, an.tags as ai_tags, an.analyzed_at,
      CASE WHEN bk.id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked
    FROM ads a
    JOIN brands b ON b.id = a.brand_id
    LEFT JOIN ad_analyses an ON an.ad_id = a.id
    LEFT JOIN bookmarks bk ON bk.ad_id = a.id
    WHERE a.id = ?
  `).get(id);
}

export function upsertAd(data: {
  brand_id: number;
  ad_archive_id?: string;
  title?: string;
  body?: string;
  cta_text?: string;
  cta_link?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  impressions_lower?: number;
  impressions_upper?: number;
  spend_lower?: number;
  spend_upper?: number;
  currency?: string;
  started_at?: string;
  ended_at?: string;
  is_active?: number;
  raw_json?: string;
}) {
  const db = getDb();
  return db.prepare(`
    INSERT INTO ads (
      brand_id, ad_archive_id, title, body, cta_text, cta_link,
      media_type, media_url, thumbnail_url,
      impressions_lower, impressions_upper,
      spend_lower, spend_upper, currency,
      started_at, ended_at, is_active, raw_json
    ) VALUES (
      @brand_id, @ad_archive_id, @title, @body, @cta_text, @cta_link,
      @media_type, @media_url, @thumbnail_url,
      @impressions_lower, @impressions_upper,
      @spend_lower, @spend_upper, @currency,
      @started_at, @ended_at, @is_active, @raw_json
    )
    ON CONFLICT(ad_archive_id) DO UPDATE SET
      title = excluded.title,
      body = excluded.body,
      cta_text = excluded.cta_text,
      media_url = excluded.media_url,
      thumbnail_url = excluded.thumbnail_url,
      impressions_lower = excluded.impressions_lower,
      impressions_upper = excluded.impressions_upper,
      is_active = excluded.is_active
  `).run(data);
}

export function upsertAnalysis(data: {
  ad_id: number;
  asset_type: string;
  visual_format: string;
  messaging_angle: string;
  hook_tactic: string;
  offer_type: string;
  summary: string;
  tags: string;
}) {
  const db = getDb();
  db.prepare('DELETE FROM ad_analyses WHERE ad_id = ?').run(data.ad_id);
  return db.prepare(`
    INSERT INTO ad_analyses (ad_id, asset_type, visual_format, messaging_angle, hook_tactic, offer_type, summary, tags)
    VALUES (@ad_id, @asset_type, @visual_format, @messaging_angle, @hook_tactic, @offer_type, @summary, @tags)
  `).run(data);
}

export function toggleBookmark(ad_id: number): boolean {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM bookmarks WHERE ad_id = ?').get(ad_id);
  if (existing) {
    db.prepare('DELETE FROM bookmarks WHERE ad_id = ?').run(ad_id);
    return false;
  } else {
    db.prepare('INSERT INTO bookmarks (ad_id) VALUES (?)').run(ad_id);
    return true;
  }
}
