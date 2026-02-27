import { randomUUID } from "crypto";
import { demoBrands, demoCampaigns } from "@/lib/demo/data";
import { Brand, BrandDNA, CampaignIdea } from "@/lib/types";

const brands = new Map<string, Brand>(demoBrands.map((b) => [b.id, b]));
const campaigns = new Map<string, CampaignIdea[]>(demoBrands.map((b) => [b.id, demoCampaigns]));

export function listBrands(): Brand[] {
  return Array.from(brands.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createBrand(input: Omit<Brand, "id" | "createdAt" | "brandDna">): Brand {
  const brand: Brand = { ...input, id: randomUUID(), createdAt: new Date().toISOString(), brandDna: null };
  brands.set(brand.id, brand);
  return brand;
}

export function getBrand(id: string): Brand | undefined {
  return brands.get(id);
}

export function saveBrandDna(id: string, dna: BrandDNA): Brand | undefined {
  const brand = brands.get(id);
  if (!brand) return;
  const next = { ...brand, brandDna: dna };
  brands.set(id, next);
  return next;
}

export function saveCampaigns(id: string, nextCampaigns: CampaignIdea[]) {
  campaigns.set(id, nextCampaigns);
}

export function getCampaigns(id: string): CampaignIdea[] {
  return campaigns.get(id) ?? [];
}
