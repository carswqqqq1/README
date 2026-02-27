import { Brand, BrandDNA, CampaignIdea } from "@/lib/types";

export const demoDNA: BrandDNA = {
  colors: ["#0F172A", "#1D4ED8", "#22C55E", "#F8FAFC", "#F59E0B", "#E11D48"],
  fonts: { primary: "Inter", secondary: "Merriweather" },
  toneTraits: [
    { trait: "Direct", score: 83 },
    { trait: "Premium", score: 72 },
    { trait: "Helpful", score: 88 },
    { trait: "Playful", score: 41 },
    { trait: "Authoritative", score: 79 },
    { trait: "Community-led", score: 66 }
  ],
  keyOffers: [
    "Done-for-you campaigns",
    "Same-week launch support",
    "Audience-first creative",
    "Data-backed hooks",
    "Monthly optimization",
    "Performance dashboard"
  ],
  visualStyle: "Clean modern layouts with bold contrast, rounded cards, and product-in-context visuals.",
  approvedVoiceExamples: [
    "Turn a week of ideas into a month of on-brand content.",
    "Your campaigns deserve more than generic templates.",
    "From brief to launch in days, not months."
  ],
  doList: ["Lead with outcome", "Use concise lines", "Reference real customer pain"],
  dontList: ["Overhype claims", "Use vague buzzwords", "Sound robotic"]
};

export const demoBrands: Brand[] = [
  { id: "demo-1", name: "Northstar Dental", websiteUrl: "https://northstar-demo.com", tagline: "Family-first dental care", targetAudience: "Young families", brandDna: demoDNA, createdAt: new Date().toISOString() },
  { id: "demo-2", name: "Apex HVAC", websiteUrl: "https://apex-hvac-demo.com", tagline: "Comfort all year", targetAudience: "Homeowners", brandDna: demoDNA, createdAt: new Date().toISOString() }
];

export const demoCampaigns: CampaignIdea[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `cmp-${i + 1}`,
  goal: ["leads", "awareness", "promo", "hiring", "reviews"][i % 5] as CampaignIdea["goal"],
  hook: `Campaign hook ${i + 1}: Get faster growth with on-brand content`,
  angle: "Proof-driven transformation story",
  targetPersona: "Busy local business owner",
  offer: "Free strategy call + 30-day content plan",
  cta: "Book your free call",
  channels: ["IG Reel", "Story", "LinkedIn"]
}));
