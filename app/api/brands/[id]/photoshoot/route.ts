import { NextResponse } from "next/server";
import { generatePhotoshootVariations } from "@/lib/llm/openai";

export async function POST(req: Request) {
  const data = await req.formData();
  const template = String(data.get("template") || "Studio");
  const images = await generatePhotoshootVariations(template);
  return NextResponse.json({ images });
}
