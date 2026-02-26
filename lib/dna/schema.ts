import { z } from "zod";

export const brandDnaSchema = z.object({
  colors: z.array(z.string()).min(3).max(6),
  fonts: z.object({ primary: z.string(), secondary: z.string() }),
  toneTraits: z.array(z.object({ trait: z.string(), score: z.number().min(0).max(100) })).min(6).max(10),
  keyOffers: z.array(z.string()).min(5).max(10),
  visualStyle: z.string(),
  approvedVoiceExamples: z.array(z.string()).length(3),
  doList: z.array(z.string()).min(3).max(6),
  dontList: z.array(z.string()).min(3).max(6),
  competitors: z.array(z.string()).optional()
});

export const campaignSchema = z.array(
  z.object({
    id: z.string(),
    goal: z.enum(["leads", "awareness", "promo", "hiring", "reviews"]),
    hook: z.string(),
    angle: z.string(),
    targetPersona: z.string(),
    offer: z.string(),
    cta: z.string(),
    channels: z.array(z.string())
  })
).length(10);
