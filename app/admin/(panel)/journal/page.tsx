import { adminDb } from "@/lib/admin-data";
import { dateFr } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function JournalAdmin() {
  const db = await adminDb();
  const { data } = await db.from("audit_log").select("*").order("at", { ascending: false }).limit(200);
  const rows = (data || []) as { id: number; at: string; actor: string | null; action: string; entity: string | null; entity_id: string | null; details: unknown }[];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Journal d’activité</h1>
      <p className="text-sm text-slate-600">Toutes les actions sensibles de l’administration sont enregistrées ici (200 dernières).</p>
      <div className="adm-card overflow-x-auto p-0">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-slate-200 bg-slate-50"><tr><th className="adm-th">Date</th><th className="adm-th">Admin</th><th className="adm-th">Action</th><th className="adm-th">Objet</th><th className="adm-th">Détails</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="adm-td whitespace-nowrap">{dateFr(r.at, true)}</td>
                <td className="adm-td">{r.actor}</td>
                <td className="adm-td font-semibold">{r.action}</td>
                <td className="adm-td text-xs">{r.entity} {r.entity_id ? `· ${String(r.entity_id).slice(0, 8)}` : ""}</td>
                <td className="adm-td max-w-xs truncate text-xs text-slate-500">{r.details ? JSON.stringify(r.details) : ""}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="adm-td text-center text-slate-500">Aucune action enregistrée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
