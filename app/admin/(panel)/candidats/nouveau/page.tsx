import { CandidateForm } from "@/components/admin/CandidateForm";
import { Flash } from "@/components/admin/Flash";
import { adminCategories } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function NewCandidate({ searchParams }: { searchParams: { err?: string } }) {
  const cats = await adminCategories();
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">Nouveau candidat</h1>
      <Flash err={searchParams.err} />
      <CandidateForm categories={cats} />
    </div>
  );
}
