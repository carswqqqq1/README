import { NextRequest, NextResponse } from "next/server";
import { createBrand, listBrands } from "@/lib/store";

export async function GET() {
  return NextResponse.json({ brands: listBrands() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const brand = createBrand(body);
  return NextResponse.json({ brand });
}
