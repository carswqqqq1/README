import { BrandDNA } from "@/lib/types";

export function DnaCard({ dna }: { dna: BrandDNA }) {
  return (
    <div className="grid gap-4 rounded-xl border bg-white p-4">
      <h3 className="text-lg font-semibold">Brand DNA</h3>
      <div className="flex gap-2">{dna.colors.map((c) => <div key={c} title={c} className="h-8 w-8 rounded border" style={{ background: c }} />)}</div>
      <p><strong>Fonts:</strong> {dna.fonts.primary} / {dna.fonts.secondary}</p>
      <div className="flex flex-wrap gap-2">{dna.toneTraits.map((t) => <span key={t.trait} className="rounded-full bg-slate-100 px-2 py-1 text-xs">{t.trait} ({t.score})</span>)}</div>
      <div>
        <p className="font-medium">Approved voice examples</p>
        <ul className="list-disc pl-5 text-sm">{dna.approvedVoiceExamples.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><p className="font-medium">Do</p><ul className="list-disc pl-5">{dna.doList.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><p className="font-medium">Don't</p><ul className="list-disc pl-5">{dna.dontList.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
    </div>
  );
}
