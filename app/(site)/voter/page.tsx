import type { Metadata } from "next";
import { ArtistExplorer } from "@/components/ArtistExplorer";
import { ContestBanner } from "@/components/ContestBanner";
import { PageHead } from "@/components/PageHead";
import { getCandidates, getCategories, getSettings } from "@/lib/data";
import { voteGate } from "@/lib/status";

export const metadata: Metadata = { title: "Voter", description: "Choisis ton artiste et vote en quelques secondes. 100 FCFA = 1 vote." };

export default async function VotePage({ searchParams }: { searchParams: { c?: string } }) {
  const [categories, candidates, settings] = await Promise.all([getCategories(), getCandidates(), getSettings()]);
  const slim = candidates.map((c) => ({ id: c.id, slug: c.slug, name: c.name, photo_url: c.photo_url, votes_count: c.votes_count, rank: c.rank, category_id: c.category_id }));
  const gates: Record<string, boolean> = {};
  categories.forEach((c) => (gates[c.id] = voteGate(c, settings).ok));
  return (
    <>
      <PageHead kicker="1 · Choisis ton artiste" title="Voter" text="Appuie sur VOTER sous la photo de ton artiste préféré." />
      <ContestBanner settings={settings} />
      <div className="container-x py-4">
        <ArtistExplorer candidates={slim} categories={categories} gates={gates} initialCategory={searchParams?.c || ""} />
      </div>
    </>
  );
}
