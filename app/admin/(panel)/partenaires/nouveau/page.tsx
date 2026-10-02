import { Flash } from "@/components/admin/Flash";
import { PartnerForm } from "@/components/admin/PartnerForm";

export const dynamic = "force-dynamic";

export default function NewPartner({ searchParams }: { searchParams: { err?: string } }) {
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">Nouveau partenaire</h1>
      <Flash err={searchParams.err} />
      <PartnerForm />
    </div>
  );
}
