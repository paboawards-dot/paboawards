import { ImageUploader } from "./ImageUploader";
import { savePartner } from "@/app/admin/actions";
import type { Partner } from "@/lib/types";

export function PartnerForm({ p }: { p?: Partner }) {
  return (
    <form action={savePartner} className="adm-card space-y-5">
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="adm-label" htmlFor="name">Nom *</label><input id="name" name="name" required defaultValue={p?.name} className="adm-input" /></div>
        <div><label className="adm-label" htmlFor="role">Rôle</label><input id="role" name="role" defaultValue={p?.role || ""} placeholder="Partenaire officiel" className="adm-input" /></div>
      </div>
      <div><label className="adm-label" htmlFor="description">Description</label><textarea id="description" name="description" rows={4} defaultValue={p?.description || ""} className="adm-textarea" /></div>
      <ImageUploader name="logo_url" label="Logo" initial={p?.logo_url ? [p.logo_url] : []} folder="partenaires" keepAlpha />
      <ImageUploader name="images" label="Images supplémentaires" initial={p?.images || []} multiple folder="partenaires" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="adm-label" htmlFor="sort">Ordre d’affichage</label><input id="sort" type="number" name="sort" defaultValue={p?.sort ?? 99} className="adm-input" /></div>
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold"><input type="checkbox" name="visible" defaultChecked={p ? p.visible : true} className="h-5 w-5" /> Visible sur le site</label>
      </div>
      <button type="submit" className="adm-btn">Enregistrer</button>
    </form>
  );
}
