import type { Metadata } from "next";
import { ArtistExplorer } from "@/components/ArtistExplorer";
import { PageHead } from "@/components/PageHead";
import { getCandidates, getCategories, getSettings } from "@/lib/data";
import { voteGate } from "@/lib/status";

export const metadata: Metadata = { title: "Les artistes", description: "Découvre tous les artistes et candidats des PABO AWARDS et vote pour ton favori." };

export default async function ArtistsPage({ searchParams }: { searchParams: { c?: string } }) {
  const [categories, candidates, settings] = await Promise.all([getCategories(), getCandidates(), getSettings()]);
  const slim = candidates.map((c) => ({ id: c.id, slug: c.slug, name: c.name, photo_url: c.photo_url, votes_count: c.votes_count, rank: c.rank, category_id: c.category_id }));
  const gates: Record<string, boolean> = {};
  categories.forEach((c) => (gates[c.id] = voteGate(c, settings).ok));
  return (
    <>
      <PageHead kicker="Les candidats" title="Les artistes" text="Cherche un nom ou choisis une catégorie." />
      <div className="container-x py-4">
        <ArtistExplorer candidates={slim} categories={categories} gates={gates} initialCategory={searchParams?.c || ""} />
      </div>
    </>
  );
}
