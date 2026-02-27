import { NextRequest, NextResponse } from "next/server";
import { createBrand, listBrands } from "@/lib/store";
import { normalizeWebsiteUrl } from "@/lib/utils/url";

export async function GET() {
  return NextResponse.json({ brands: listBrands() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body?.name || !body?.websiteUrl) {
    return NextResponse.json({ error: "name and websiteUrl are required" }, { status: 400 });
  }

  try {
    const brand = createBrand({
      name: String(body.name).trim(),
      websiteUrl: normalizeWebsiteUrl(String(body.websiteUrl)),
      tagline: body.tagline ? String(body.tagline) : null,
      targetAudience: body.targetAudience ? String(body.targetAudience) : null
    });

    return NextResponse.json({ brand });
  } catch {
    return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
  }
}
