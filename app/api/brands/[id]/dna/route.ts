import { NextResponse } from "next/server";
import { buildBrandDnaFromPages } from "@/lib/dna/build";
import { scrapeWebsite } from "@/lib/scrape/pipeline";
import { getBrand, saveBrandDna } from "@/lib/store";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = getBrand(id);
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (brand.brandDna) return NextResponse.redirect(new URL(`/brands/${id}`, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));

  const pages = await scrapeWebsite(brand.websiteUrl);
  const dna = await buildBrandDnaFromPages(pages);
  saveBrandDna(id, dna);
  return NextResponse.redirect(new URL(`/brands/${id}`, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
