import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const template = req.nextUrl.searchParams.get("template") || "Studio";
  const v = req.nextUrl.searchParams.get("v") || "1";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#1d4ed8'/><stop offset='1' stop-color='#0f172a'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='64' y='140' fill='white' font-size='56' font-family='Arial'>${template} Variation ${v}</text></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml" } });
}
