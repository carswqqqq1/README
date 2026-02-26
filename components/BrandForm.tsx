"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BrandForm() {
  const [form, setForm] = useState({ name: "", websiteUrl: "", tagline: "", targetAudience: "" });
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/brands", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", websiteUrl: "", tagline: "", targetAudience: "" });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2 rounded-xl border bg-white p-4">
      <h3 className="font-semibold">Create Brand</h3>
      <input className="rounded border p-2" placeholder="Brand name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input className="rounded border p-2" placeholder="Website URL" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} required />
      <input className="rounded border p-2" placeholder="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
      <input className="rounded border p-2" placeholder="Target audience" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
      <button className="rounded bg-slate-900 px-4 py-2 text-white">Save</button>
    </form>
  );
}
