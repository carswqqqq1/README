import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getBrand, getCampaigns } from "@/lib/store";

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = getBrand(id);
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const zip = new JSZip();
  zip.file("brand.json", JSON.stringify(brand, null, 2));
  const campaigns = getCampaigns(id);
  zip.file("campaigns.json", JSON.stringify(campaigns, null, 2));
  zip.file("campaigns.csv", toCsv([["hook", "goal", "cta"], ...campaigns.map((c) => [c.hook, c.goal, c.cta])]));
  const content = await zip.generateAsync({ type: "uint8array" });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=${brand.name.replace(/\s+/g, "-")}-campaign-pack.zip`
    }
  });
}
