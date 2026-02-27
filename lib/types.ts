export type ToneTrait = {
  trait: string;
  score: number;
};

export type BrandDNA = {
  colors: string[];
  fonts: { primary: string; secondary: string };
  toneTraits: ToneTrait[];
  keyOffers: string[];
  visualStyle: string;
  approvedVoiceExamples: string[];
  doList: string[];
  dontList: string[];
  competitors?: string[];
};

export type Brand = {
  id: string;
  name: string;
  websiteUrl: string;
  tagline?: string | null;
  targetAudience?: string | null;
  brandDna?: BrandDNA | null;
  createdAt: string;
};

export type CampaignIdea = {
  id: string;
  goal: "leads" | "awareness" | "promo" | "hiring" | "reviews";
  hook: string;
  angle: string;
  targetPersona: string;
  offer: string;
  cta: string;
  channels: string[];
};

export type AssetPack = {
  shortCaptions: string[];
  longCaptions: string[];
  headlines: string[];
  ctas: string[];
  heroSection: { headline: string; subhead: string; bullets: string[] };
  imageUrl?: string;
};

export type PhotoshootTemplate = "Studio" | "Lifestyle" | "Flatlay";
