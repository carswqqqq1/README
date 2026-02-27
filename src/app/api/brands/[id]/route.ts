import { NextRequest, NextResponse } from 'next/server';
import { getBrandById, deleteBrand } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const brand = await getBrandById(Number(params.id));
    if (!brand) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(brand);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteBrand(Number(params.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
