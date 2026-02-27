"use client";

import { useState } from "react";
import { AssetEditor } from "@/components/AssetEditor";
import { AssetPack, CampaignIdea } from "@/lib/types";

export default function AssetClient({ campaign }: { campaign: CampaignIdea }) {
  const [assets, setAssets] = useState<AssetPack | null>(null);
  return (
    <div className="grid gap-4">
      <AssetEditor campaign={campaign} onGenerated={setAssets} />
      {assets && (
        <div className="rounded-xl border bg-white p-4 text-sm">
          <p className="font-semibold">Generated Assets</p>
          <pre className="overflow-auto whitespace-pre-wrap">{JSON.stringify(assets, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
