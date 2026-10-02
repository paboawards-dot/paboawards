import type { Metadata } from "next";
import { CategoryCard } from "@/components/CategoryCard";
import { PageHead } from "@/components/PageHead";
import { Reveal } from "@/components/Reveal";
import { getCandidates, getCategories, getUniverses } from "@/lib/data";

export const revalidate = 30;
export const metadata: Metadata = { title: "Les 15 catégories", description: "Découvre les 15 catégories des PABO AWARDS et vote pour ton artiste." };

export default async function CategoriesPage() {
  const [universes, categories, candidates] = await Promise.all([getUniverses(), getCategories(), getCandidates()]);
  const counts: Record<string, number> = {};
  candidates.forEach((c) => (counts[c.category_id] = (counts[c.category_id] || 0) + 1));
  return (
    <>
      <PageHead kicker="Prix de l’Art du Bounkani" title="Les 15 catégories" text="Choisis une catégorie, découvre les candidats et vote pour ton favori." />
      <div className="container-x space-y-12 py-6">
        {categories.length === 0 && <p className="glass rounded-3xl p-8 text-center text-white/70">Les catégories arrivent bientôt.</p>}
        {universes.map((u) => {
          const list = categories.filter((c) => c.universe_id === u.id);
          if (!list.length) return null;
          return (
            <section key={u.id} id={u.slug} aria-labelledby={`u-${u.id}`} className="scroll-mt-24">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-10 w-2 rounded-full" style={{ background: u.color }} />
                <div>
                  <h2 id={`u-${u.id}`} className="section-title">{u.name}</h2>
                  {u.tagline && <p className="text-white/70">{u.tagline}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {list.map((c, i) => (
                  <Reveal key={c.id} delay={(i % 4) * 70} className="h-full">
                    <CategoryCard cat={c} count={counts[c.id] ?? 0} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
