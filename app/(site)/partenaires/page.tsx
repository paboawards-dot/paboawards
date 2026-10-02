import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { PartnerCard } from "@/components/PartnerCard";
import { Reveal } from "@/components/Reveal";
import { getPartners } from "@/lib/data";

export const revalidate = 120;
export const metadata: Metadata = { title: "Partenaires", description: "Les partenaires et organisateurs des PABO AWARDS." };

export default async function PartnersPage() {
  const partners = await getPartners();
  return (
    <>
      <PageHead kicker="Ils soutiennent" title="Partenaires" text="Merci à celles et ceux qui rendent les PABO AWARDS possibles." />
      <div className="container-x py-6">
        {partners.length === 0 ? (
          <p className="glass mx-auto max-w-md rounded-3xl p-8 text-center text-white/70">Les partenaires seront présentés très bientôt.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 80} className="h-full"><PartnerCard p={p} /></Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
