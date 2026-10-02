import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { adminPartners } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function PartnersAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const partners = await adminPartners();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Partenaires ({partners.length})</h1>
        <Link href="/admin/partenaires/nouveau" className="adm-btn">＋ Nouveau partenaire</Link>
      </div>
      <Flash ok={searchParams.ok} err={searchParams.err} />
      <div className="adm-card divide-y divide-slate-100 p-0">
        {partners.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            {p.logo_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.logo_url} alt="" className="h-14 w-20 rounded-lg bg-white object-contain ring-1 ring-slate-200" /> : <span className="h-14 w-20 rounded-lg bg-slate-200" />}
            <div className="min-w-0 flex-1"><p className="truncate font-bold">{p.name}</p><p className="text-xs text-slate-500">{p.role || "—"} · {p.visible ? "visible" : "masqué"}</p></div>
            <Link href={`/admin/partenaires/${p.id}`} className="adm-btn-ghost">Modifier</Link>
          </div>
        ))}
        {partners.length === 0 && <p className="p-6 text-center text-slate-500">Aucun partenaire.</p>}
      </div>
    </div>
  );
}
