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

export async function scrapeAds(libraryUrl: string): Promise<ApifyAd[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error('APIFY_API_TOKEN is not set');

  // Start async run
  const startRes = await fetch(
    `https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/runs?token=${token}&memory=512`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urls: [{ url: libraryUrl }],
        maxResults: 50,
      }),
    }
  );

  if (!startRes.ok) {
    const text = await startRes.text();
    throw new Error(`Apify start failed (${startRes.status}): ${text}`);
  }

  const startData = await startRes.json();
  const runId: string = startData?.data?.id;
  if (!runId) throw new Error('Apify did not return a run ID');

  // Poll until done (max 5 minutes)
  const pollUrl = `https://api.apify.com/v2/acts/curious_coder~facebook-ads-library-scraper/runs/${runId}?token=${token}`;
  const deadline = Date.now() + 5 * 60 * 1000;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 10_000));
    const pollRes = await fetch(pollUrl);
    const pollData = await pollRes.json();
    const status: string = pollData?.data?.status ?? '';

    if (status === 'SUCCEEDED') {
      const datasetId: string = pollData.data.defaultDatasetId;
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&limit=50`
      );
      const items: ApifyAd[] = await itemsRes.json();
      return items;
    }

    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      throw new Error(`Apify run ${status.toLowerCase()}`);
    }
    // else RUNNING / READY — keep polling
  }

  throw new Error('Apify run timed out after 5 minutes');
}

export function normalizeAd(raw: ApifyAd, brandId: number) {
  const snap = raw.snapshot ?? {};

  // Determine media type
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

  // impressions_with_index doesn't give lower/upper bounds — store index as lower as proxy
  const impIndex = raw.impressions_with_index?.impressions_index ?? undefined;

  return {
    brand_id: brandId,
    ad_archive_id: raw.ad_archive_id ?? raw.ad_id,
    title: snap.title ?? snap.cards?.[0]?.title ?? '',
    body: body,
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
