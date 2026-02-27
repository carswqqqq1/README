import { CampaignList } from "@/components/CampaignList";
import { getBrand, getCampaigns } from "@/lib/store";

export default async function CampaignsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ goal?: string }> }) {
  const { id } = await params;
  const { goal } = await searchParams;
  const brand = getBrand(id);
  if (!brand) return <p>Brand not found.</p>;

  const campaigns = getCampaigns(id);

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">Campaign Ideas</h2>
      <form action={`/api/brands/${id}/campaigns`} method="post">
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Generate 10 ideas</button>
      </form>
      <div className="flex gap-2 text-sm">
        {['leads','awareness','promo','hiring','reviews'].map((g) => <a key={g} href={`?goal=${g}`} className="rounded border bg-white px-2 py-1">{g}</a>)}
      </div>
      <CampaignList campaigns={campaigns} goal={goal} />
    </div>
  );
}
