import { NextRequest, NextResponse } from 'next/server';
import { getAllBrands, insertBrand } from '@/lib/db';

export async function GET() {
  try {
    const brands = await getAllBrands();
    return NextResponse.json(brands);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, library_url, category } = body as {
      name: string;
      library_url: string;
      category?: string;
    };

    if (!name || !library_url) {
      return NextResponse.json({ error: 'name and library_url are required' }, { status: 400 });
    }

    const result = await insertBrand({ name, library_url, category: category ?? 'DTC' });
    return NextResponse.json({ id: (result as any).lastInsertRowid }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Brand with this URL already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
