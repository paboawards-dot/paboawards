import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { adminDb } from "@/lib/admin-data";
import type { Partner } from "@/lib/types";
import { deletePartner } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditPartner({ params, searchParams }: { params: { id: string }; searchParams: { err?: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const db = await adminDb();
  const { data } = await db.from("partners").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const p = data as Partner;
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">Modifier : {p.name}</h1>
      <Flash err={searchParams.err} />
      <PartnerForm p={p} />
      <form action={deletePartner} className="adm-card flex items-center justify-between gap-3">
        <input type="hidden" name="id" value={p.id} />
        <p className="text-sm text-slate-600">Supprimer ce partenaire.</p>
        <ConfirmButton message={`Supprimer ${p.name} ?`}>Supprimer</ConfirmButton>
      </form>
    </div>
  );
}
