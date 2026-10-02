import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { adminNews } from "@/lib/admin-data";
import { dateFr } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function NewsAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const news = await adminNews();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Actualités ({news.length})</h1>
        <Link href="/admin/actualites/nouveau" className="adm-btn">＋ Nouvelle actualité</Link>
      </div>
      <Flash ok={searchParams.ok} err={searchParams.err} />
      <div className="adm-card divide-y divide-slate-100 p-0">
        {news.map((n) => (
          <div key={n.id} className="flex items-center gap-3 p-3">
            {n.images[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={n.images[0]} alt="" className="h-14 w-20 rounded-lg object-cover" /> : <span className="h-14 w-20 rounded-lg bg-slate-200" />}
            <div className="min-w-0 flex-1"><p className="truncate font-bold">{n.title}</p><p className="text-xs text-slate-500">{dateFr(n.published_at)} · {n.images.length} image(s) · {n.published ? "publiée" : "brouillon"}</p></div>
            <Link href={`/admin/actualites/${n.id}`} className="adm-btn-ghost">Modifier</Link>
          </div>
        ))}
        {news.length === 0 && <p className="p-6 text-center text-slate-500">Aucune actualité.</p>}
      </div>
    </div>
  );
}
