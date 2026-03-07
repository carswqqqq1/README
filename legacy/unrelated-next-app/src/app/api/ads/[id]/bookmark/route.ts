import { NextRequest, NextResponse } from 'next/server';
import { toggleBookmark } from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookmarked = await toggleBookmark(Number(params.id));
    return NextResponse.json({ bookmarked });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
