import { NextRequest, NextResponse } from "next/server";
import { generateAssets } from "@/lib/llm/openai";
import { getBrand } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { campaign, controls } = await req.json();
  const brand = getBrand(id);
  if (!brand?.brandDna) return NextResponse.json({ error: "Build DNA first" }, { status: 400 });
  const assets = await generateAssets(brand.brandDna, campaign, controls);
  return NextResponse.json({ assets });
}
