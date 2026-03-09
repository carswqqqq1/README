import { createClient } from '@libsql/client';

let _client: ReturnType<typeof createClient> | null = null;
let _initPromise: Promise<void> | null = null;

export function getDb() {
  if (_client) return _client;

  const url = process.env.TURSO_CONNECTION_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    throw new Error('TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN are required');
  }

  _client = createClient({ url, authToken: token });
  return _client;
}

export async function ensureInit() {
  if (!_initPromise) {
    _initPromise = initDb();
  }
  return _initPromise;
}

export async function initDb() {
  const db = getDb();

  const statements = [
    `CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      page_id TEXT,
      library_url TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'DTC',
      logo_url TEXT,
      last_scraped_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS ads (
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
    )`,
    `CREATE TABLE IF NOT EXISTS ad_analyses (
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
    )`,
    `CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE UNIQUE,
      note TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_ads_brand_id ON ads(brand_id)`,
    `CREATE INDEX IF NOT EXISTS idx_ads_media_type ON ads(media_type)`,
    `CREATE INDEX IF NOT EXISTS idx_ads_impressions ON ads(impressions_lower DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_ad_analyses_ad_id ON ad_analyses(ad_id)`,
    `CREATE INDEX IF NOT EXISTS idx_bookmarks_ad_id ON bookmarks(ad_id)`,
  ];

  for (const sql of statements) {
    await db.execute(sql);
  }
}

// ─── Brand helpers ────────────────────────────────────────────────────────────

export async function getAllBrands() {
  await ensureInit();
  const db = getDb();
  const result = await db.execute(`
    SELECT b.*, COUNT(a.id) as ad_count
    FROM brands b
    LEFT JOIN ads a ON a.brand_id = b.id
    GROUP BY b.id
    ORDER BY b.name ASC
  `);
  return result.rows;
}

export async function getBrandById(id: number) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM brands WHERE id = ?',
    args: [id],
  });
  return result.rows[0];
}

export async function insertBrand(data: {
  name: string;
  library_url: string;
  page_id?: string;
  category?: string;
  logo_url?: string;
}) {
  await ensureInit();
  const db = getDb();
  const result = await db.execute({
    sql: `
      INSERT INTO brands (name, library_url, page_id, category, logo_url)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [data.name, data.library_url, data.page_id ?? null, data.category ?? 'DTC', data.logo_url ?? null],
  });
  return result;
}

export async function updateBrandScrapedAt(id: number) {
  const db = getDb();
  await db.execute({
    sql: `UPDATE brands SET last_scraped_at = datetime('now') WHERE id = ?`,
    args: [id],
  });
}

export async function deleteBrand(id: number) {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM brands WHERE id = ?',
    args: [id],
  });
}

// ─── Ad helpers ───────────────────────────────────────────────────────────────

export async function getAds(filters: {
  brand_id?: number;
  media_type?: string;
  bookmarked?: boolean;
  search?: string;
  tags?: string;
  limit?: number;
  offset?: number;
}) {
  await ensureInit();
  const db = getDb();
  const conditions: string[] = [];
  const args: unknown[] = [];

  if (filters.brand_id) {
    conditions.push('a.brand_id = ?');
    args.push(filters.brand_id);
  }
  if (filters.media_type) {
    conditions.push('a.media_type = ?');
    args.push(filters.media_type);
  }
  if (filters.bookmarked) {
    conditions.push('bk.id IS NOT NULL');
  }
  if (filters.search) {
    conditions.push('(a.title LIKE ? OR a.body LIKE ?)');
    const search = `%${filters.search}%`;
    args.push(search, search);
  }
  if (filters.tags) {
    conditions.push("an.tags LIKE ?");
    args.push(`%${filters.tags}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  const sql = `
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
  `;

  const result = await db.execute({ sql, args: args as any });
  return result.rows;
}

export async function getAdById(id: number) {
  const db = getDb();
  const result = await db.execute({
    sql: `
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
    `,
    args: [id],
  });
  return result.rows[0];
}

export async function upsertAd(data: {
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
  return await db.execute({
    sql: `
      INSERT INTO ads (
        brand_id, ad_archive_id, title, body, cta_text, cta_link,
        media_type, media_url, thumbnail_url,
        impressions_lower, impressions_upper,
        spend_lower, spend_upper, currency,
        started_at, ended_at, is_active, raw_json
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?
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
    `,
    args: [
      data.brand_id,
      data.ad_archive_id,
      data.title,
      data.body,
      data.cta_text,
      data.cta_link,
      data.media_type,
      data.media_url,
      data.thumbnail_url,
      data.impressions_lower,
      data.impressions_upper,
      data.spend_lower,
      data.spend_upper,
      data.currency,
      data.started_at,
      data.ended_at,
      data.is_active,
      data.raw_json,
    ] as any,
  });
}

export async function upsertAnalysis(data: {
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
  await db.execute({
    sql: 'DELETE FROM ad_analyses WHERE ad_id = ?',
    args: [data.ad_id],
  });
  return await db.execute({
    sql: `
      INSERT INTO ad_analyses (ad_id, asset_type, visual_format, messaging_angle, hook_tactic, offer_type, summary, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.ad_id,
      data.asset_type,
      data.visual_format,
      data.messaging_angle,
      data.hook_tactic,
      data.offer_type,
      data.summary,
      data.tags,
    ],
  });
}

export async function toggleBookmark(ad_id: number): Promise<boolean> {
  const db = getDb();
  const existing = await db.execute({
    sql: 'SELECT id FROM bookmarks WHERE ad_id = ?',
    args: [ad_id],
  });
  if (existing.rows.length > 0) {
    await db.execute({
      sql: 'DELETE FROM bookmarks WHERE ad_id = ?',
      args: [ad_id],
    });
    return false;
  } else {
    await db.execute({
      sql: 'INSERT INTO bookmarks (ad_id) VALUES (?)',
      args: [ad_id],
    });
    return true;
  }
}
