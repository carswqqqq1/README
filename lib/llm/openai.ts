import OpenAI from "openai";
import { campaignSchema } from "@/lib/dna/schema";
import { demoCampaigns, demoDNA } from "@/lib/demo/data";
import { AssetPack, BrandDNA, CampaignIdea } from "@/lib/types";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

async function structuredJson<T>(prompt: string, fallback: T): Promise<T> {
  if (!client) return fallback;
  const res = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
    temperature: 0.2
  });
  const text = res.output_text;
  return JSON.parse(text) as T;
}

export async function generateDnaFromText(text: string, fallback: BrandDNA, fix = false): Promise<BrandDNA> {
  return structuredJson<BrandDNA>(
    `${fix ? "Fix and return valid JSON only." : "Return strict JSON only."}\nInfer brand DNA from this website copy:\n${text.slice(0, 12000)}\nJSON schema keys: colors, fonts, toneTraits, keyOffers, visualStyle, approvedVoiceExamples, doList, dontList, competitors`,
    fallback || demoDNA
  );
}

export async function generateCampaigns(dna: BrandDNA): Promise<CampaignIdea[]> {
  const fallback = demoCampaigns;
  const data = await structuredJson<CampaignIdea[]>(`Return 10 campaign ideas as JSON array for this DNA: ${JSON.stringify(dna)}`, fallback);
  const parsed = campaignSchema.safeParse(data);
  return parsed.success ? parsed.data : fallback;
}

export async function generateAssets(dna: BrandDNA, campaign: CampaignIdea, controls?: Record<string, string>): Promise<AssetPack> {
  const fallback: AssetPack = {
    shortCaptions: [
      `${campaign.hook}. ${campaign.cta}.`,
      `Built for ${campaign.targetPersona.toLowerCase()}. ${campaign.cta}.`,
      `${campaign.angle}. ${campaign.cta}.`
    ],
    longCaptions: [
      `${campaign.hook}\n\n${campaign.offer}\n\n${campaign.cta}`,
      `When ${campaign.targetPersona.toLowerCase()} need results fast, this angle wins.\n${campaign.offer}\n${campaign.cta}`,
      `Stay on-brand with ${dna.toneTraits[0]?.trait || "direct"} voice while promoting ${campaign.offer}. ${campaign.cta}`
    ],
    headlines: Array.from({ length: 5 }).map((_, i) => `${campaign.hook} #${i + 1}`),
    ctas: ["Book a call", "DM us", "Learn more", "Get started", "Claim offer"],
    heroSection: {
      headline: campaign.hook,
      subhead: campaign.angle,
      bullets: [campaign.offer, `Best for ${campaign.targetPersona}`, `Channel mix: ${campaign.channels.join(", ")}`]
    }
  };

  if (!client) return fallback;
  return structuredJson<AssetPack>(
    `Return strict JSON. DNA: ${JSON.stringify(dna)} Campaign: ${JSON.stringify(campaign)} Controls: ${JSON.stringify(controls || {})}`,
    fallback
  );
}

export async function generatePhotoshootVariations(template: string): Promise<string[]> {
  if (!client) return Array.from({ length: 4 }).map((_, i) => `/api/placeholder-image?template=${template}&v=${i}`);
  return Array.from({ length: 4 }).map((_, i) => `/api/placeholder-image?template=${template}&v=${i}`);
}
