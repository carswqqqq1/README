import { demoDNA } from "@/lib/demo/data";
import { brandDnaSchema } from "@/lib/dna/schema";
import { generateDnaFromText } from "@/lib/llm/openai";
import { ScrapedPage } from "@/lib/scrape/pipeline";
import { BrandDNA } from "@/lib/types";

const colorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
const fontRegex = /font-family\s*:\s*([^;]+);/g;

function extractColors(css: string): string[] {
  const colors = css.match(colorRegex) || [];
  return Array.from(new Set(colors)).slice(0, 6);
}

function extractFonts(css: string): { primary: string; secondary: string } {
  const fonts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = fontRegex.exec(css)) !== null) {
    fonts.push(match[1].split(",")[0].replace(/["']/g, "").trim());
  }
  const uniq = Array.from(new Set(fonts));
  return { primary: uniq[0] || "Inter", secondary: uniq[1] || "Merriweather" };
}

export async function buildBrandDnaFromPages(pages: ScrapedPage[]): Promise<BrandDNA> {
  const css = pages.map((p) => p.css).join("\n");
  const text = pages.map((p) => p.text).join("\n");

  const seed = {
    ...demoDNA,
    colors: extractColors(css).length > 2 ? extractColors(css) : demoDNA.colors,
    fonts: extractFonts(css)
  };

  const maybe = await generateDnaFromText(text, seed).catch(() => seed);
  const parsed = brandDnaSchema.safeParse(maybe);
  if (parsed.success) return parsed.data;

  const fixed = await generateDnaFromText(`Fix JSON strictly for this schema: ${JSON.stringify(parsed.error.issues)}`, seed, true).catch(
    () => seed
  );
  return brandDnaSchema.parse(fixed);
}
