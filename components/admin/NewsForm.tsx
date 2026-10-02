import { ImageUploader } from "./ImageUploader";
import { saveNews } from "@/app/admin/actions";
import type { News } from "@/lib/types";

export function NewsForm({ n }: { n?: News }) {
  return (
    <form action={saveNews} className="adm-card space-y-5">
      {n && <input type="hidden" name="id" value={n.id} />}
      <div><label className="adm-label" htmlFor="title">Titre *</label><input id="title" name="title" required defaultValue={n?.title} className="adm-input" /></div>
      <div><label className="adm-label" htmlFor="body">Texte</label><textarea id="body" name="body" rows={6} defaultValue={n?.body || ""} className="adm-textarea" /></div>
      <ImageUploader name="images" label="Images (galerie / carrousel)" initial={n?.images || []} multiple folder="actualites" hint="Images uniquement. La première sert de couverture." />
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="published" defaultChecked={n ? n.published : true} className="h-5 w-5" /> Publiée sur le site</label>
      <button type="submit" className="adm-btn">Enregistrer</button>
    </form>
  );
}
