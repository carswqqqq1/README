import { NextRequest, NextResponse } from 'next/server';
import { getAdById } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ad = getAdById(Number(params.id));
    if (!ad) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(ad);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
