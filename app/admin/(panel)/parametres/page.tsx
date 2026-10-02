import { Flash } from "@/components/admin/Flash";
import { adminSettings, toLocalInput } from "@/lib/admin-data";
import { saveSettings } from "../../actions";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin({ searchParams }: { searchParams: { ok?: string; err?: string } }) {
  const s = await adminSettings();
  const f = (label: string, name: string, value: string | number | null | undefined, type = "text", ph?: string) => (
    <div><label className="adm-label" htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={value ?? ""} placeholder={ph} className="adm-input" /></div>
  );
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">Paramètres</h1>
      <Flash ok={searchParams.ok} err={searchParams.err} />
      <form action={saveSettings} className="space-y-5">
        <div className="adm-card space-y-4">
          <div><p className="font-bold">Dates du concours</p><p className="text-sm text-slate-500">Heure d’Abidjan (identique à l’heure UTC). Le compte à rebours du site suit ces dates.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {f("Lancement des sélections", "selections_at", toLocalInput(s?.selections_at), "datetime-local")}
            {f("Ouverture des votes", "votes_open_at", toLocalInput(s?.votes_open_at), "datetime-local")}
            {f("Clôture des votes", "votes_close_at", toLocalInput(s?.votes_close_at), "datetime-local")}
            {f("Cérémonie (fin du concours)", "ceremony_at", toLocalInput(s?.ceremony_at), "datetime-local")}
          </div>
        </div>
        <div className="adm-card space-y-4">
          <p className="font-bold">Règles de vote</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="adm-label">Prix d’un vote</label><input value={`${s?.vote_unit_price ?? 100} FCFA`} disabled className="adm-input bg-slate-100" /><p className="mt-1 text-xs text-slate-500">Fixé à 100 FCFA par le règlement.</p></div>
            {f("Maximum de votes par paiement (vide = aucun)", "max_votes_per_payment", s?.max_votes_per_payment, "number")}
          </div>
        </div>
        <div className="adm-card space-y-4">
          <p className="font-bold">Contact et réseaux</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {f("Téléphone affiché", "contact_phone", s?.contact_phone)}
            {f("WhatsApp (chiffres, avec indicatif)", "contact_whatsapp", s?.contact_whatsapp, "text", "2250718275797")}
            {f("E-mail", "contact_email", s?.contact_email, "email")}
            {f("Lien Facebook", "facebook_url", s?.facebook_url, "url", "https://facebook.com/…")}
            {f("Lien Instagram", "instagram_url", s?.instagram_url, "url")}
            {f("Lien TikTok", "tiktok_url", s?.tiktok_url, "url")}
          </div>
        </div>
        <button type="submit" className="adm-btn">Enregistrer les paramètres</button>
      </form>
    </div>
  );
}
