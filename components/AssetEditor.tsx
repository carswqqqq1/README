"use client";

import { useState } from "react";
import { AssetPack, CampaignIdea } from "@/lib/types";

export function AssetEditor({ campaign, onGenerated }: { campaign: CampaignIdea; onGenerated: (assets: AssetPack) => void }) {
  const [controls, setControls] = useState({ tone: "friendly", length: "medium", ctaStyle: "book call", include: "", avoid: "" });
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch(window.location.pathname.replace("/assets", "/campaigns") + "/generate-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaign, controls })
    });
    const json = await res.json();
    onGenerated(json.assets);
    setLoading(false);
  }

  return (
    <div className="grid gap-2 rounded-xl border bg-white p-4">
      <h3 className="font-semibold">Quick editor</h3>
      {Object.entries(controls).map(([k, v]) => (
        <input key={k} className="rounded border p-2" value={v} placeholder={k} onChange={(e) => setControls({ ...controls, [k]: e.target.value })} />
      ))}
      <button onClick={generate} disabled={loading} className="rounded bg-slate-900 px-4 py-2 text-white">{loading ? "Generating..." : "Generate Assets"}</button>
    </div>
  );
}
