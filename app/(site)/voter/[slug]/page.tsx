import type { Metadata } from "next";
import Link from "next/link";
import { StateScreen } from "@/components/StateScreen";
import { VoteWizard } from "@/components/VoteWizard";
import { getCandidateBySlug, getCategories, getSettings } from "@/lib/data";
import { voteGate } from "@/lib/status";
import { DEFAULT_UNIT_PRICE } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Voter", robots: { index: false, follow: true } };

export default async function VoteForPage({ params }: { params: { slug: string } }) {
  const [cand, categories, settings] = await Promise.all([getCandidateBySlug(params.slug), getCategories(), getSettings()]);
  if (!cand) {
    return (
      <StateScreen icon="🔎" title="Artiste introuvable" text="Cet artiste n’existe pas ou n’est plus disponible.">
        <Link href="/artistes" className="btn-vote">Voir les artistes</Link>
      </StateScreen>
    );
  }
  const cat = categories.find((c) => c.id === cand.category_id);
  if (!cat) return null;
  const gate = voteGate(cat, settings);
  if (!gate.ok) {
    const map = {
      soon: { icon: "⏳", title: "Bientôt ouvert", text: "Les votes ne sont pas encore ouverts. Reviens très vite !" },
      closed: { icon: "🔒", title: "Votes fermés", text: "Les votes sont fermés pour le moment." },
      ended: { icon: "🏁", title: "Concours terminé", text: "Merci à tous les votants !" },
      category_closed: { icon: "🔒", title: "Catégorie fermée", text: "Les votes de cette catégorie sont terminés." },
      ok: { icon: "✅", title: "", text: "" },
    }[gate.reason];
    return (
      <StateScreen icon={map.icon} title={map.title} text={map.text} tone="wait">
        <Link href={`/artistes/${cand.slug}`} className="btn-ghost">Voir la fiche de {cand.name}</Link>
        <Link href="/classement" className="btn-ghost">Voir le classement</Link>
      </StateScreen>
    );
  }
  return (
    <div className="container-x pb-10 pt-4">
      <VoteWizard
        candidate={{ id: cand.id, slug: cand.slug, name: cand.name, photo_url: cand.photo_url }}
        category={{ name: cat.name, color: cat.color, emoji: cat.emoji }}
        unitPrice={settings?.vote_unit_price || DEFAULT_UNIT_PRICE}
        maxVotes={settings?.max_votes_per_payment ?? null}
      />
    </div>
  );
}
