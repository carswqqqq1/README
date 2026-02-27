import Link from "next/link";
import { BrandForm } from "@/components/BrandForm";
import { listBrands } from "@/lib/store";

export default function BrandsPage() {
  const brands = listBrands();
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
      <BrandForm />
      <div className="grid gap-3">
        {brands.map((brand) => (
          <Link key={brand.id} href={`/brands/${brand.id}`} className="rounded-xl border bg-white p-4 hover:border-slate-400">
            <h3 className="font-semibold">{brand.name}</h3>
            <p className="text-sm text-slate-600">{brand.websiteUrl}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
