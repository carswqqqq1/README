import Link from "next/link";
import { DnaCard } from "@/components/DnaCard";
import { getBrand } from "@/lib/store";

export default async function BrandDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = getBrand(id);
  if (!brand) return <p>Brand not found.</p>;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{brand.name}</h2>
          <p className="text-sm text-slate-600">{brand.websiteUrl}</p>
        </div>
        <form action={`/api/brands/${id}/dna`} method="post">
          <button className="rounded bg-slate-900 px-4 py-2 text-white">{brand.brandDna ? "Rebuild DNA" : "Build DNA"}</button>
        </form>
      </div>
      {brand.brandDna ? <DnaCard dna={brand.brandDna} /> : <p className="rounded border bg-amber-50 p-3 text-sm">No DNA yet.</p>}
      <div className="flex gap-2">
        <Link href={`/brands/${id}/campaigns`} className="rounded border bg-white px-3 py-2">Campaign ideas</Link>
        <Link href={`/brands/${id}/assets`} className="rounded border bg-white px-3 py-2">Assets</Link>
        <Link href={`/brands/${id}/photoshoot`} className="rounded border bg-white px-3 py-2">Photoshoot-lite</Link>
      </div>
    </div>
  );
}
