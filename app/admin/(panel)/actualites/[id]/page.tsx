import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Flash } from "@/components/admin/Flash";
import { NewsForm } from "@/components/admin/NewsForm";
import { adminDb } from "@/lib/admin-data";
import type { News } from "@/lib/types";
import { deleteNews } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditNews({ params, searchParams }: { params: { id: string }; searchParams: { err?: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const db = await adminDb();
  const { data } = await db.from("news").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const n = data as News;
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">Modifier l’actualité</h1>
      <Flash err={searchParams.err} />
      <NewsForm n={n} />
      <form action={deleteNews} className="adm-card flex items-center justify-between gap-3">
        <input type="hidden" name="id" value={n.id} />
        <p className="text-sm text-slate-600">Supprimer cette actualité.</p>
        <ConfirmButton message="Supprimer cette actualité ?">Supprimer</ConfirmButton>
      </form>
    </div>
  );
}
