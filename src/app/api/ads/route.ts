import { NextRequest, NextResponse } from 'next/server';
import { getAds } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const filters = {
      brand_id: sp.get('brand_id') ? Number(sp.get('brand_id')) : undefined,
      media_type: sp.get('media_type') ?? undefined,
      bookmarked: sp.get('bookmarked') === 'true',
      search: sp.get('search') ?? undefined,
      tags: sp.get('tags') ?? undefined,
      limit: sp.get('limit') ? Number(sp.get('limit')) : 50,
      offset: sp.get('offset') ? Number(sp.get('offset')) : 0,
    };
    const ads = getAds(filters);
    return NextResponse.json(ads);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
