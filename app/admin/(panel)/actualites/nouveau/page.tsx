import { Flash } from "@/components/admin/Flash";
import { NewsForm } from "@/components/admin/NewsForm";

export const dynamic = "force-dynamic";

export default function NewNews({ searchParams }: { searchParams: { err?: string } }) {
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">Nouvelle actualité</h1>
      <Flash err={searchParams.err} />
      <NewsForm />
    </div>
  );
}
