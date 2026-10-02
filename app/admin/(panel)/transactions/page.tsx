import Link from "next/link";
import { adminDb } from "@/lib/admin-data";
import { dateFr, fcfa, num } from "@/lib/format";
import { METHODS } from "@/lib/config";

export const dynamic = "force-dynamic";
const PER = 50;

const BADGE: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700", expired: "bg-slate-200 text-slate-600", flagged: "bg-fuchsia-100 text-fuchsia-700",
};

export default async function TransactionsAdmin({ searchParams }: { searchParams: { s?: string; q?: string; p?: string } }) {
  const db = await adminDb();
  const page = Math.max(1, Number(searchParams.p) || 1);
  let query = db.from("transactions").select("ref,created_at,confirmed_at,votes,amount,method,country,phone,status,candidates(name)", { count: "exact" }).order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  if (searchParams.s) query = query.eq("status", searchParams.s);
  const q = (searchParams.q || "").trim().replace(/[^A-Za-z0-9+]/g, "");
  if (q) query = query.or(`ref.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data, count } = await query;
  const rows = (data || []) as any[];
  const pages = Math.max(1, Math.ceil((count || 0) / PER));
  const href = (p: number) => `/admin/transactions?${new URLSearchParams({ ...(searchParams.s ? { s: searchParams.s } : {}), ...(searchParams.q ? { q: searchParams.q } : {}), p: String(p) })}`;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Transactions ({num(count || 0)})</h1>
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={searchParams.q || ""} placeholder="N° de transaction ou téléphone" className="adm-input max-w-xs" />
        <select name="s" defaultValue={searchParams.s || ""} className="adm-input max-w-[200px]">
          <option value="">Tous les statuts</option>
          {["confirmed", "pending", "failed", "expired", "flagged"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="adm-btn-ghost" type="submit">Filtrer</button>
      </form>
      <div className="adm-card overflow-x-auto p-0">
        <table className="w-full min-w-[860px]">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="adm-th">Date</th><th className="adm-th">N°</th><th className="adm-th">Candidat</th><th className="adm-th">Votes</th><th className="adm-th">Montant</th><th className="adm-th">Moyen</th><th className="adm-th">Téléphone</th><th className="adm-th">Statut</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((t) => (
              <tr key={t.ref}>
                <td className="adm-td whitespace-nowrap">{dateFr(t.created_at, true)}</td>
                <td className="adm-td font-mono text-xs">{t.ref}</td>
                <td className="adm-td">{t.candidates?.name || "—"}</td>
                <td className="adm-td">{num(t.votes)}</td>
                <td className="adm-td whitespace-nowrap">{fcfa(t.amount)}</td>
                <td className="adm-td">{METHODS.find((m) => m.id === t.method)?.short || t.method}</td>
                <td className="adm-td whitespace-nowrap">+{t.phone}</td>
                <td className="adm-td"><span className={`adm-badge ${BADGE[t.status] || ""}`}>{t.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="adm-td text-center text-slate-500">Aucune transaction.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        {page > 1 ? <Link className="adm-btn-ghost" href={href(page - 1)}>← Précédent</Link> : <span />}
        <span className="text-sm text-slate-500">Page {page} / {pages}</span>
        {page < pages ? <Link className="adm-btn-ghost" href={href(page + 1)}>Suivant →</Link> : <span />}
      </div>
    </div>
  );
}
