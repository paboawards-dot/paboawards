import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { adminCandidates, adminCategories } from "@/lib/admin-data";
import { num } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CandidatesAdmin({ searchParams }: { searchParams: { ok?: string; err?: string; c?: string } }) {
  const [cands, cats] = await Promise.all([adminCandidates(), adminCategories()]);
  const catById = new Map(cats.map((c) => [c.id, c]));
  const shown = searchParams.c ? cands.filter((c) => c.category_id === searchParams.c) : cands;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Candidats ({shown.length})</h1>
        <Link href="/admin/candidats/nouveau" className="adm-btn">＋ Nouveau candidat</Link>
      </div>
      <Flash ok={searchParams.ok} err={searchParams.err} />
      <form className="flex gap-2">
        <select name="c" defaultValue={searchParams.c || ""} className="adm-input max-w-md">
          <option value="">Toutes les catégories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
        <button className="adm-btn-ghost" type="submit">Filtrer</button>
      </form>
      <div className="adm-card overflow-x-auto p-0">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="adm-th">Photo</th><th className="adm-th">Nom</th><th className="adm-th">Catégorie</th><th className="adm-th">Votes</th><th className="adm-th">Statut</th><th className="adm-th" /></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map((c) => (
              <tr key={c.id}>
                <td className="adm-td">{c.photo_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.photo_url} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200 text-slate-500">—</span>}</td>
                <td className="adm-td font-semibold">{c.name}</td>
                <td className="adm-td">{catById.get(c.category_id)?.name}</td>
                <td className="adm-td">{num(c.votes_count)}</td>
                <td className="adm-td"><span className={`adm-badge ${c.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{c.status === "active" ? "visible" : "masqué"}</span></td>
                <td className="adm-td text-right"><Link href={`/admin/candidats/${c.id}`} className="adm-btn-ghost">Modifier</Link></td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={6} className="adm-td text-center text-slate-500">Aucun candidat.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
