import { ImageUploader } from "./ImageUploader";
import { saveCandidate } from "@/app/admin/actions";
import type { Candidate, Category } from "@/lib/types";

export function CandidateForm({ cand, categories }: { cand?: Candidate; categories: Category[] }) {
  return (
    <form action={saveCandidate} className="adm-card space-y-5">
      {cand && <input type="hidden" name="id" value={cand.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="adm-label" htmlFor="name">Nom *</label>
          <input id="name" name="name" required defaultValue={cand?.name} className="adm-input" />
        </div>
        <div>
          <label className="adm-label" htmlFor="category_id">Catégorie *</label>
          <select id="category_id" name="category_id" required defaultValue={cand?.category_id || ""} className="adm-input">
            <option value="" disabled>Choisir…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
      </div>
      <ImageUploader name="photo_url" label="Photo principale" initial={cand?.photo_url ? [cand.photo_url] : []} folder="candidats" hint="Photo verticale conseillée (format 4:5). Compressée automatiquement." />
      <ImageUploader name="gallery" label="Galerie de photos" initial={cand?.gallery || []} multiple folder="candidats" />
      <div>
        <label className="adm-label" htmlFor="bio">Biographie</label>
        <textarea id="bio" name="bio" rows={5} defaultValue={cand?.bio || ""} className="adm-textarea" />
      </div>
      <div>
        <label className="adm-label" htmlFor="info">Informations essentielles (une par ligne)</label>
        <textarea id="info" name="info" rows={3} defaultValue={cand?.info || ""} placeholder={"Ville : Bouna\nGenre : Afrobeat"} className="adm-textarea" />
      </div>
      <div className="sm:w-60">
        <label className="adm-label" htmlFor="status">Statut</label>
        <select id="status" name="status" defaultValue={cand?.status || "active"} className="adm-input">
          <option value="active">Visible sur le site</option>
          <option value="hidden">Masqué</option>
        </select>
      </div>
      {cand && <p className="text-sm text-slate-500">Votes : <b>{cand.votes_count}</b> (calculés automatiquement — non modifiables).</p>}
      <div className="flex gap-3"><button type="submit" className="adm-btn">Enregistrer</button></div>
    </form>
  );
}
