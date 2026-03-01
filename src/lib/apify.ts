/**
 * Apify integration for scraping Meta Ad Library.
 *
 * Uses the `curious_coder/facebook-ads-library-scraper` actor.
 * Docs: https://apify.com/curious_coder/facebook-ads-library-scraper
 */

export interface ApifyAd {
  ad_archive_id?: string;
  ad_id?: string;
  page_id?: string;
  page_name?: string;
  is_active?: boolean;
  currency?: string;
  spend?: { lower_bound?: number; upper_bound?: number } | null;
  impressions_with_index?: { impressions_text?: string | null; impressions_index?: number } | null;
  start_date?: number;
  end_date?: number;
  snapshot?: {
    cta_text?: string;
    cta_type?: string;
    link_url?: string;
    body?: string | { markup?: { __html?: string } };
    caption?: string;
    title?: string;
    cards?: Array<{
      title?: string;
      body?: string;
      cta_type?: string;
      cta_text?: string;
      link_url?: string;
      video_sd_url?: string;
      video_hd_url?: string;
      original_image_url?: string;
      resized_image_url?: string;
      video_preview_image_url?: string;
    }>;
    videos?: Array<{
      video_sd_url?: string;
      video_hd_url?: string;
      video_preview_image_url?: string;
    }>;
    images?: Array<{
      original_image_url?: string;
      resized_image_url?: string;
    }>;
  };
}

const ACTOR = 'curious_coder~facebook-ads-library-scraper';

/** Start an async Apify run. Returns the run ID immediately. */
export async function startScrapeRun(libraryUrl: string): Promise<string> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error('APIFY_API_TOKEN is not set');

  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR}/runs?token=${token}&memory=512`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: [{ url: libraryUrl }], maxResults: 50 }),
    }
  );

  const text = await res.text();
  if (!res.ok) throw new Error(`Apify start failed (${res.status}): ${text}`);

  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error(`Apify returned non-JSON: ${text.slice(0, 200)}`); }

  const runId = data?.data?.id;
  if (!runId) throw new Error('Apify did not return a run ID');
  return runId;
}

/** Check run status. Returns ads array if done, null if still running, throws on failure. */
export async function checkScrapeRun(runId: string): Promise<ApifyAd[] | null> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error('APIFY_API_TOKEN is not set');

  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR}/runs/${runId}?token=${token}`
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Apify status check failed (${res.status}): ${text.slice(0, 200)}`);

  let data: any;
  try { data = JSON.parse(text); } catch { throw new Error(`Apify returned non-JSON: ${text.slice(0, 200)}`); }

  const status: string = data?.data?.status ?? '';

  if (status === 'SUCCEEDED') {
    const datasetId: string = data.data.defaultDatasetId;
    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&limit=50`
    );
    const itemsText = await itemsRes.text();
    try {
      return JSON.parse(itemsText) as ApifyAd[];
    } catch {
      throw new Error(`Apify dataset returned non-JSON: ${itemsText.slice(0, 200)}`);
    }
  }

  if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
    throw new Error(`Apify run ${status.toLowerCase()}`);
  }

  // RUNNING or READY — still in progress
  return null;
}

export function normalizeAd(raw: ApifyAd, brandId: number) {
  const snap = raw.snapshot ?? {};

  let mediaType: 'image' | 'video' | 'carousel' | 'unknown' = 'unknown';
  let mediaUrl: string | undefined;
  let thumbnailUrl: string | undefined;

  if (snap.cards && snap.cards.length > 1) {
    mediaType = 'carousel';
    const first = snap.cards[0];
    mediaUrl = first?.video_sd_url ?? first?.original_image_url ?? first?.resized_image_url;
    thumbnailUrl = first?.original_image_url ?? first?.resized_image_url;
  } else if (snap.videos && snap.videos.length > 0) {
    mediaType = 'video';
    mediaUrl = snap.videos[0].video_hd_url ?? snap.videos[0].video_sd_url;
    thumbnailUrl = snap.videos[0].video_preview_image_url;
  } else if (snap.images && snap.images.length > 0) {
    mediaType = 'image';
    mediaUrl = snap.images[0].original_image_url ?? snap.images[0].resized_image_url;
    thumbnailUrl = mediaUrl;
  } else if (snap.cards && snap.cards.length === 1) {
    const c = snap.cards[0];
    if (c.video_sd_url || c.video_hd_url) {
      mediaType = 'video';
      mediaUrl = c.video_hd_url ?? c.video_sd_url;
      thumbnailUrl = c.video_preview_image_url;
    } else {
      mediaType = 'image';
      mediaUrl = c.original_image_url ?? c.resized_image_url;
      thumbnailUrl = mediaUrl;
    }
  }

  const body =
    typeof snap.body === 'string'
      ? snap.body
      : (snap.body as any)?.markup?.__html?.replace(/<[^>]+>/g, '') ?? '';

  const impIndex = raw.impressions_with_index?.impressions_index ?? undefined;

  return {
    brand_id: brandId,
    ad_archive_id: raw.ad_archive_id ?? raw.ad_id,
    title: snap.title ?? snap.cards?.[0]?.title ?? '',
    body,
    cta_text: snap.cta_text ?? snap.cta_type ?? snap.cards?.[0]?.cta_text ?? snap.cards?.[0]?.cta_type ?? '',
    cta_link: snap.link_url ?? snap.cards?.[0]?.link_url ?? '',
    media_type: mediaType,
    media_url: mediaUrl ?? '',
    thumbnail_url: thumbnailUrl ?? '',
    impressions_lower: impIndex !== undefined && impIndex >= 0 ? impIndex : undefined,
    impressions_upper: undefined,
    spend_lower: raw.spend?.lower_bound,
    spend_upper: raw.spend?.upper_bound,
    currency: raw.currency ?? 'USD',
    started_at: raw.start_date ? new Date(raw.start_date * 1000).toISOString() : undefined,
    ended_at: raw.end_date ? new Date(raw.end_date * 1000).toISOString() : undefined,
    is_active: raw.is_active ? 1 : 0,
    raw_json: JSON.stringify(raw),
  };
}
