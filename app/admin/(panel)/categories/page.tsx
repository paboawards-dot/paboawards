import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { adminCandidates, adminCategories, adminUniverses, toLocalInput } from "@/lib/admin-data";
import { num } from "@/lib/format";
import type { Category, Universe } from "@/lib/types";
import { deleteCategory, extendCategory, saveCategory, setCategoryStatus } from "../../actions";

export const dynamic = "force-dynamic";

function CategoryFields({ cat, universes }: { cat?: Category; universes: Universe[] }) {
  return (
    <form action={saveCategory} className="space-y-3">
      {cat && <input type="hidden" name="id" value={cat.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className="adm-label">Nom *</label><input name="name" required defaultValue={cat?.name} className="adm-input" /></div>
        <div><label className="adm-label">Univers</label>
          <select name="universe_id" defaultValue={cat?.universe_id || universes[0]?.id} className="adm-input">{universes.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
        <div><label className="adm-label">Emoji / icône</label><input name="emoji" defaultValue={cat?.emoji || "🏆"} className="adm-input" /></div>
        <div><label className="adm-label">Couleur dominante</label><input type="color" name="color" defaultValue={cat?.color || "#8b5cf6"} className="h-11 w-full rounded-xl border border-slate-300 bg-white p-1" /></div>
        <div><label className="adm-label">Ordre d’affichage</label><input type="number" name="sort" defaultValue={cat?.sort ?? 99} className="adm-input" /></div>
      </div>
      <ImageUploader name="image_url" label="Visuel de la catégorie (facultatif)" initial={cat?.image_url ? [cat.image_url] : []} folder="categories" />
      <button type="submit" className="adm-btn">Enregistrer</button>
    </form>
  );
}

export default async function CategoriesAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const [cats, universes, cands] = await Promise.all([adminCategories(), adminUniverses(), adminCandidates()]);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Catégories ({cats.length})</h1>
      <Flash ok={searchParams.ok} err={searchParams.err} />
      <details className="adm-card">
        <summary className="cursor-pointer font-bold">＋ Nouvelle catégorie</summary>
        <div className="mt-4"><CategoryFields universes={universes} /></div>
      </details>
      <div className="space-y-3">
        {cats.map((c) => {
          const list = cands.filter((x) => x.category_id === c.id).sort((a, b) => b.votes_count - a.votes_count);
          const votes = list.reduce((s, x) => s + x.votes_count, 0);
          return (
            <div key={c.id} className="adm-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-extrabold"><span aria-hidden>{c.emoji}</span> {c.name}</p>
                  <p className="text-sm text-slate-500">{universes.find((u) => u.id === c.universe_id)?.name} · {list.length} candidat(s) · {num(votes)} vote(s){list[0] && list[0].votes_count > 0 ? ` · en tête : ${list[0].name}` : ""}</p>
                  {c.extended_until && <p className="text-sm font-semibold text-amber-600">Prolongée jusqu’au {c.extended_until.slice(0, 16).replace("T", " à ")}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`adm-badge ${c.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{c.status === "open" ? "ouverte" : "fermée"}</span>
                  <form action={setCategoryStatus}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="status" value={c.status === "open" ? "closed" : "open"} />
                    <ConfirmButton className="adm-btn-ghost" message={c.status === "open" ? "Fermer cette catégorie ?" : "Rouvrir cette catégorie ?"}>{c.status === "open" ? "Fermer" : "Rouvrir"}</ConfirmButton>
                  </form>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-indigo-600">Prolonger, modifier, supprimer</summary>
                <div className="mt-4 space-y-5">
                  <form action={extendCategory} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <div><label className="adm-label">Prolongation exceptionnelle jusqu’au (heure UTC)</label><input type="datetime-local" name="extended_until" defaultValue={toLocalInput(c.extended_until)} className="adm-input" /></div>
                    <button type="submit" className="adm-btn-ghost">Appliquer</button>
                    <span className="text-xs text-slate-500">Vide = retirer la prolongation.</span>
                  </form>
                  <CategoryFields cat={c} universes={universes} />
                  <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><ConfirmButton message={`Supprimer la catégorie « ${c.name} » ?`}>Supprimer la catégorie</ConfirmButton></form>
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
