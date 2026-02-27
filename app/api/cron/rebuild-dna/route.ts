import { NextRequest, NextResponse } from "next/server";
import { buildBrandDnaFromPages } from "@/lib/dna/build";
import { scrapeWebsite } from "@/lib/scrape/pipeline";
import { listBrands, saveBrandDna } from "@/lib/store";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const brands = listBrands().slice(0, 3);
  const rebuilt: string[] = [];

  for (const brand of brands) {
    try {
      const pages = await scrapeWebsite(brand.websiteUrl);
      const dna = await buildBrandDnaFromPages(pages);
      saveBrandDna(brand.id, dna);
      rebuilt.push(brand.name);
    } catch {
      // skip failures to keep cron resilient
    }
  }

  return NextResponse.json({ rebuiltCount: rebuilt.length, rebuilt });
}
