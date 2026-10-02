import { Flash } from "@/components/admin/Flash";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { adminCandidates, adminCategories, adminSettings, getAdminStats } from "@/lib/admin-data";
import { contestInfo } from "@/lib/status";
import { dateFr, fcfa, num } from "@/lib/format";
import { reconcilePending, toggleVotes } from "../actions";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const [stats, settings, categories, candidates] = await Promise.all([getAdminStats(), adminSettings(), adminCategories(), adminCandidates()]);
  const info = contestInfo(settings);
  const per = new Map(stats.per_category.map((p) => [p.category_id, p]));
  const maxDay = Math.max(1, ...stats.daily.map((d) => d.revenue));
  const tile = (label: string, value: string, sub?: string) => (
    <div className="adm-card"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-3xl font-extrabold">{value}</p>{sub && <p className="text-sm text-slate-500">{sub}</p>}</div>
  );
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Tableau de bord</h1>
      <Flash ok={searchParams.ok} err={searchParams.err} />

      <div className="adm-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Statut du concours</p>
          <p className="text-xl font-extrabold">{info.label}</p>
          <p className="text-sm text-slate-500">Ouverture : {dateFr(settings?.votes_open_at, true) || "—"} · Clôture : {dateFr(settings?.votes_close_at, true) || "—"} · Cérémonie : {dateFr(settings?.ceremony_at, true) || "—"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={toggleVotes}>
            <input type="hidden" name="enabled" value={settings?.votes_enabled ? "0" : "1"} />
            <ConfirmButton className={settings?.votes_enabled ? "adm-btn-danger" : "adm-btn"} message={settings?.votes_enabled ? "Fermer TOUS les votes maintenant ?" : "Autoriser les votes (selon les dates) ?"}>
              {settings?.votes_enabled ? "Fermer les votes" : "Ouvrir les votes"}
            </ConfirmButton>
          </form>
          <form action={reconcilePending}><button type="submit" className="adm-btn-ghost">Vérifier les paiements en attente</button></form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tile("Votes confirmés", num(stats.votes))}
        {tile("Votants", num(stats.voters))}
        {tile("Revenus", fcfa(stats.revenue), `${num(stats.confirmed)} paiement(s) confirmé(s)`)}
        {tile("En attente / échoués", `${num(stats.pending)} / ${num(stats.failed)}`, stats.flagged ? `⚠️ ${stats.flagged} à vérifier` : undefined)}
      </div>

      {stats.daily.length > 0 && (
        <div className="adm-card">
          <p className="mb-3 font-bold">Revenus des 14 derniers jours</p>
          <div className="flex h-32 items-end gap-1.5">
            {stats.daily.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day} : ${fcfa(d.revenue)} · ${d.votes} votes`}>
                <div className="w-full rounded-t bg-indigo-500" style={{ height: `${Math.max(4, (d.revenue / maxDay) * 100)}%` }} />
                <span className="text-[10px] text-slate-500">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="adm-card overflow-x-auto">
        <p className="mb-3 font-bold">Catégories : classement, recettes et répartition 50 / 50</p>
        <table className="w-full min-w-[720px]">
          <thead><tr><th className="adm-th">Catégorie</th><th className="adm-th">Candidats</th><th className="adm-th">Votes</th><th className="adm-th">Recettes</th><th className="adm-th">En tête</th><th className="adm-th">Part gagnant (50 %)</th><th className="adm-th">Part organisation (50 %)</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => {
              const p = per.get(c.id);
              const list = candidates.filter((x) => x.category_id === c.id).sort((a, b) => b.votes_count - a.votes_count);
              const rev = p?.revenue || 0;
              return (
                <tr key={c.id}>
                  <td className="adm-td"><span aria-hidden>{c.emoji}</span> {c.name} {c.status === "closed" && <span className="adm-badge bg-red-100 text-red-700">fermée</span>}</td>
                  <td className="adm-td">{list.length}</td>
                  <td className="adm-td font-semibold">{num(p?.votes || 0)}</td>
                  <td className="adm-td">{fcfa(rev)}</td>
                  <td className="adm-td">{list[0] && list[0].votes_count > 0 ? list[0].name : "—"}</td>
                  <td className="adm-td">{fcfa(rev * 0.5)}</td>
                  <td className="adm-td">{fcfa(rev * 0.5)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-500">Ces montants sont visibles uniquement ici : le site public n’affiche jamais les recettes.</p>
      </div>
    </div>
  );
}
