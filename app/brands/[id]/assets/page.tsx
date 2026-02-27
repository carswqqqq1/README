import Link from "next/link";
import AssetClient from "./AssetClient";
import { getCampaigns } from "@/lib/store";

export default async function AssetsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaigns = getCampaigns(id);
  const campaign = campaigns[0];
  if (!campaign) {
    return (
      <div>
        <p>No campaigns yet.</p>
        <Link href={`/brands/${id}/campaigns`} className="underline">Generate campaigns first</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">Asset Generator</h2>
      <AssetClient campaign={campaign} />
      <a href={`/api/brands/${id}/export`} className="w-fit rounded bg-slate-900 px-4 py-2 text-white">Export campaign pack zip</a>
    </div>
  );
}
