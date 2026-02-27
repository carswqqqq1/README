import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "branddna-studio", timestamp: new Date().toISOString() });
}
