import { NextRequest, NextResponse } from 'next/server';
import { getBrandById, upsertAd, updateBrandScrapedAt } from '@/lib/db';
import { startScrapeRun, checkScrapeRun, normalizeAd } from '@/lib/apify';

// POST /api/brands/[id]/scrape — starts an Apify run, returns { runId }
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const brandId = Number(params.id);
  try {
    const brand = await getBrandById(brandId) as any;
    if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });

    const runId = await startScrapeRun(brand.library_url);
    return NextResponse.json({ runId });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}

// GET /api/brands/[id]/scrape?runId=xxx — polls status, saves to DB when done
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const brandId = Number(params.id);
  const runId = _req.nextUrl.searchParams.get('runId');
  if (!runId) return NextResponse.json({ error: 'runId is required' }, { status: 400 });

  try {
    const rawAds = await checkScrapeRun(runId);

    if (rawAds === null) {
      return NextResponse.json({ done: false, status: 'running' });
    }

    let inserted = 0;
    for (const raw of rawAds) {
      const normalized = normalizeAd(raw, brandId);
      await upsertAd(normalized);
      inserted++;
    }
    await updateBrandScrapedAt(brandId);

    return NextResponse.json({ done: true, scraped: inserted });
  } catch (err) {
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }
}
