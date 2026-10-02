import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { RankingBoard } from "@/components/RankingBoard";
import { getCandidates, getCategories } from "@/lib/data";

export const revalidate = 15;
export const metadata: Metadata = { title: "Classement en direct", description: "Le classement en direct des artistes dans chacune des 15 catégories des PABO AWARDS." };

export default async function RankingPage({ searchParams }: { searchParams: { c?: string } }) {
  const [categories, candidates] = await Promise.all([getCategories(), getCandidates()]);
  const slim = candidates.map((c) => ({ id: c.id, slug: c.slug, name: c.name, photo_url: c.photo_url, category_id: c.category_id, votes_count: c.votes_count }));
  const cats = categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, color: c.color, emoji: c.emoji }));
  return (
    <>
      <PageHead kicker="En direct" title="Classement" text="Le classement se met à jour automatiquement." />
      <div className="container-x py-4">
        <RankingBoard categories={cats} candidates={slim} initialCategory={searchParams?.c} />
      </div>
    </>
  );
}
