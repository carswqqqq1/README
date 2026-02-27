/**
 * Apify integration for scraping Meta Ad Library.
 *
 * Uses the `apify/facebook-ads-library-scraper` actor.
 * Docs: https://apify.com/apify/facebook-ads-library-scraper
 */

export interface ApifyAd {
  adArchiveID?: string;
  adid?: string;
  snapshot?: {
    title?: string;
    body?: { markup?: { __html?: string } } | string;
    cta_type?: string;
    link_url?: string;
    cards?: Array<{
      title?: string;
      body?: string;
      cta_type?: string;
      link_url?: string;
      video_sd_url?: string;
      video_hd_url?: string;
      original_image_url?: string;
      resized_image_url?: string;
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
  impressions?: { lower_bound?: number; upper_bound?: number };
  spend?: { lower_bound?: number; upper_bound?: number };
  currency?: string;
  startDate?: number;
  endDate?: number;
  isActive?: boolean;
  pageID?: string;
  pageName?: string;
}

function extractPageId(libraryUrl: string): string | null {
  // Handles formats like:
  // https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&id=123456789
  // https://www.facebook.com/ads/library/?search_type=page&view_all_page_id=123456789
  const idMatch = libraryUrl.match(/[?&](?:id|view_all_page_id)=(\d+)/);
  return idMatch ? idMatch[1] : null;
}

function extractSearchQuery(libraryUrl: string): string | null {
  const qMatch = libraryUrl.match(/[?&]q=([^&]+)/);
  return qMatch ? decodeURIComponent(qMatch[1]) : null;
}

export async function scrapeAds(libraryUrl: string): Promise<ApifyAd[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error('APIFY_API_TOKEN is not set');

  const pageId = extractPageId(libraryUrl);
  const searchQuery = extractSearchQuery(libraryUrl);

  // Build input for the Apify actor
  const actorInput: Record<string, unknown> = {
    country: 'US',
    adType: 'ALL',
    activeStatus: 'ALL',
    publisherPlatform: ['facebook', 'instagram'],
    sortBy: 'impressions',      // highest impressions first
    maxResults: 50,
  };

  if (pageId) {
    actorInput.pageIDs = [pageId];
  } else if (searchQuery) {
    actorInput.searchQuery = searchQuery;
  } else {
    // Try to extract brand name from URL path as fallback
    const urlObj = new URL(libraryUrl);
    const q = urlObj.searchParams.get('q');
    if (q) actorInput.searchQuery = q;
    else throw new Error('Could not extract page ID or search query from the provided URL');
  }

  // Run the actor and wait for finish
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~facebook-ads-library-scraper/run-sync-get-dataset-items?token=${token}&timeout=120&memory=1024`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actorInput),
    }
  );

  if (!runRes.ok) {
    const text = await runRes.text();
    throw new Error(`Apify run failed (${runRes.status}): ${text}`);
  }

  const items: ApifyAd[] = await runRes.json();
  return items;
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
    if (c.video_sd_url) {
      mediaType = 'video';
      mediaUrl = c.video_hd_url ?? c.video_sd_url;
    } else {
      mediaType = 'image';
      mediaUrl = c.original_image_url ?? c.resized_image_url;
      thumbnailUrl = mediaUrl;
    }
  }

  const body =
    typeof snap.body === 'string'
      ? snap.body
      : snap.body?.markup?.__html?.replace(/<[^>]+>/g, '') ?? '';

  return {
    brand_id: brandId,
    ad_archive_id: raw.adArchiveID ?? raw.adid,
    title: snap.title ?? snap.cards?.[0]?.title ?? '',
    body: body,
    cta_text: snap.cta_type ?? snap.cards?.[0]?.cta_type ?? '',
    cta_link: snap.link_url ?? snap.cards?.[0]?.link_url ?? '',
    media_type: mediaType,
    media_url: mediaUrl ?? '',
    thumbnail_url: thumbnailUrl ?? '',
    impressions_lower: raw.impressions?.lower_bound,
    impressions_upper: raw.impressions?.upper_bound,
    spend_lower: raw.spend?.lower_bound,
    spend_upper: raw.spend?.upper_bound,
    currency: raw.currency ?? 'USD',
    started_at: raw.startDate ? new Date(raw.startDate * 1000).toISOString() : undefined,
    ended_at: raw.endDate ? new Date(raw.endDate * 1000).toISOString() : undefined,
    is_active: raw.isActive ? 1 : 0,
    raw_json: JSON.stringify(raw),
  };
}
