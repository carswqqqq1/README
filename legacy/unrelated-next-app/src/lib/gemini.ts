/**
 * Google Gemini integration for AI-powered ad analysis.
 * Analyzes images and video thumbnails to extract ad intelligence.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenerativeAI(key);
}

export interface AdAnalysis {
  asset_type: string;       // e.g. "UGC Video", "Studio Image", "Animated GIF"
  visual_format: string;    // e.g. "Split-screen", "Talking head", "Product demo"
  messaging_angle: string;  // e.g. "Social proof", "Problem/Solution", "Authority"
  hook_tactic: string;      // e.g. "Bold claim", "Question", "Shocking stat"
  offer_type: string;       // e.g. "Discount", "Free trial", "Bundle", "BOGO"
  summary: string;          // 2-3 sentence human-readable breakdown
  tags: string;             // comma-separated searchable tags
}

const SYSTEM_PROMPT = `You are an expert DTC (Direct-to-Consumer) ad analyst.
Analyze the provided ad creative and return a JSON object with the following fields:
- asset_type: The type of creative asset (e.g., "UGC Video", "Studio Image", "Animated GIF", "Carousel", "Product Demo Video", "Testimonial Video", "Lifestyle Photo")
- visual_format: The visual/production format (e.g., "Talking head", "Product demo", "Before/After", "Split-screen", "Flat lay", "Lifestyle", "Infographic", "Text overlay")
- messaging_angle: The core persuasion angle (e.g., "Social proof", "Problem/Solution", "Authority/Expert", "Transformation", "Urgency/Scarcity", "Curiosity", "Comparison", "Benefit-led")
- hook_tactic: How the ad grabs attention in the first 3 seconds (e.g., "Bold claim", "Provocative question", "Shocking statistic", "Pattern interrupt", "Direct address", "Story opener", "Pain point")
- offer_type: The promotional mechanism if any (e.g., "Discount", "Free trial", "Bundle deal", "BOGO", "Limited time", "Free gift", "Money-back guarantee", "None")
- summary: A 2-3 sentence breakdown of what makes this ad effective or notable
- tags: A comma-separated list of 5-10 searchable tags (e.g., "ugc,testimonial,skincare,problem-solution,discount")

Respond ONLY with valid JSON. No markdown, no explanation.`;

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const mimeType = contentType.split(';')[0].trim();
  const buffer = await res.arrayBuffer();
  const data = Buffer.from(buffer).toString('base64');
  return { data, mimeType };
}

export async function analyzeAd(ad: {
  title?: string;
  body?: string;
  cta_text?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
}): Promise<AdAnalysis> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const textContext = `
Ad headline: ${ad.title ?? 'N/A'}
Ad copy: ${ad.body ?? 'N/A'}
CTA: ${ad.cta_text ?? 'N/A'}
Media type: ${ad.media_type ?? 'unknown'}
`.trim();

  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: SYSTEM_PROMPT },
    { text: textContext },
  ];

  // Add image context if available
  const imageUrl = ad.thumbnail_url || (ad.media_type === 'image' ? ad.media_url : null);
  if (imageUrl) {
    try {
      const { data, mimeType } = await fetchImageAsBase64(imageUrl);
      parts.push({ inlineData: { mimeType, data } });
    } catch {
      // If image fetch fails, proceed with text-only analysis
    }
  }

  const result = await model.generateContent(parts);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(clean) as AdAnalysis;
    return parsed;
  } catch {
    // Fallback if JSON parsing fails
    return {
      asset_type: 'Unknown',
      visual_format: 'Unknown',
      messaging_angle: 'Unknown',
      hook_tactic: 'Unknown',
      offer_type: 'None',
      summary: text.slice(0, 300),
      tags: ad.media_type ?? 'unknown',
    };
  }
}
