import { NextRequest, NextResponse } from "next/server";
import { buildBrandDnaFromPages } from "@/lib/dna/build";
import { scrapeWebsite } from "@/lib/scrape/pipeline";
import { getBrand, saveBrandDna } from "@/lib/store";

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = getBrand(id);
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const force = req.nextUrl.searchParams.get("force") === "1";
  if (brand.brandDna && !force) {
    return NextResponse.redirect(new URL(`/brands/${id}`, appBaseUrl()));
  }

  const pages = await scrapeWebsite(brand.websiteUrl);
  const dna = await buildBrandDnaFromPages(pages);
  saveBrandDna(id, dna);

  return NextResponse.redirect(new URL(`/brands/${id}`, appBaseUrl()));
}
