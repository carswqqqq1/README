import { NextResponse } from "next/server";
import { generateCampaigns } from "@/lib/llm/openai";
import { getBrand, saveCampaigns } from "@/lib/store";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = getBrand(id);
  if (!brand?.brandDna) return NextResponse.json({ error: "Build DNA first" }, { status: 400 });
  const ideas = await generateCampaigns(brand.brandDna);
  saveCampaigns(id, ideas);
  return NextResponse.redirect(new URL(`/brands/${id}/campaigns`, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
