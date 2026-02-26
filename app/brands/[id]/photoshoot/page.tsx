"use client";

import { useState } from "react";

export default function PhotoshootPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState("Studio");
  const [images, setImages] = useState<string[]>([]);

  async function run(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("template", template);
    const res = await fetch(`/api/brands/${params.id}/photoshoot`, { method: "POST", body: fd });
    const json = await res.json();
    setImages(json.images);
  }

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-semibold">Photoshoot-lite</h2>
      <form onSubmit={run} className="grid gap-2 rounded-xl border bg-white p-4">
        <input type="file" name="photo" accept="image/*" required />
        <select value={template} onChange={(e) => setTemplate(e.target.value)} className="rounded border p-2">
          <option>Studio</option><option>Lifestyle</option><option>Flatlay</option>
        </select>
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Generate 4 variations</button>
      </form>
      <div className="grid grid-cols-2 gap-3">{images.map((src) => <img key={src} src={src} className="rounded border" alt="variation" />)}</div>
    </div>
  );
}
