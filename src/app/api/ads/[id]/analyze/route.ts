import { NextRequest, NextResponse } from 'next/server';
import { getAdById, upsertAnalysis } from '@/lib/db';
import { analyzeAd } from '@/lib/gemini';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const adId = Number(params.id);
  try {
    const ad = await getAdById(adId) as Record<string, unknown> | undefined;
    if (!ad) return NextResponse.json({ error: 'Ad not found' }, { status: 404 });

    const analysis = await analyzeAd({
      title: ad.title as string,
      body: ad.body as string,
      cta_text: ad.cta_text as string,
      media_type: ad.media_type as string,
      media_url: ad.media_url as string,
      thumbnail_url: ad.thumbnail_url as string,
    });

    await upsertAnalysis({ ad_id: adId, ...analysis });

    return NextResponse.json(analysis);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
