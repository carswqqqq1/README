import { CampaignIdea } from "@/lib/types";

export function CampaignList({ campaigns, goal }: { campaigns: CampaignIdea[]; goal?: string }) {
  const filtered = goal ? campaigns.filter((c) => c.goal === goal) : campaigns;
  return (
    <div className="grid gap-3">
      {filtered.map((c) => (
        <div key={c.id} className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">{c.goal}</p>
          <h4 className="font-semibold">{c.hook}</h4>
          <p className="text-sm text-slate-600">{c.angle}</p>
          <p className="text-sm">CTA: {c.cta}</p>
        </div>
      ))}
    </div>
  );
}
