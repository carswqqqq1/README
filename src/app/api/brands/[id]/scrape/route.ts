import { NextRequest, NextResponse } from 'next/server';
import { getBrandById, upsertAd, updateBrandScrapedAt } from '@/lib/db';
import { scrapeAds, normalizeAd } from '@/lib/apify';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const brandId = Number(params.id);

  try {
    const brand = getBrandById(brandId) as { id: number; library_url: string } | undefined;
    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });

    const rawAds = await scrapeAds(brand.library_url);

    let inserted = 0;
    for (const raw of rawAds) {
      const normalized = normalizeAd(raw, brandId);
      upsertAd(normalized);
      inserted++;
    }

    updateBrandScrapedAt(brandId);

    return NextResponse.json({ ok: true, scraped: inserted });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
