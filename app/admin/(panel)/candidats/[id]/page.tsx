import { notFound } from "next/navigation";
import { CandidateForm } from "@/components/admin/CandidateForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { adminCategories, adminDb } from "@/lib/admin-data";
import type { Candidate } from "@/lib/types";
import { deleteCandidate } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditCandidate({ params, searchParams }: { params: { id: string }; searchParams: { err?: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const db = await adminDb();
  const [{ data }, cats] = await Promise.all([db.from("candidates").select("*").eq("id", params.id).maybeSingle(), adminCategories()]);
  if (!data) notFound();
  const cand = data as Candidate;
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">Modifier : {cand.name}</h1>
      <Flash err={searchParams.err} />
      <CandidateForm cand={cand} categories={cats} />
      <form action={deleteCandidate} className="adm-card flex items-center justify-between gap-3">
        <input type="hidden" name="id" value={cand.id} />
        <p className="text-sm text-slate-600">Supprimer ce candidat (impossible s’il a déjà reçu des votes : masque-le alors).</p>
        <ConfirmButton message={`Supprimer définitivement ${cand.name} ?`}>Supprimer</ConfirmButton>
      </form>
    </div>
  );
}
