import type { Metadata } from "next";
import { NewsCard } from "@/components/NewsCard";
import { PageHead } from "@/components/PageHead";
import { Reveal } from "@/components/Reveal";
import { getNews } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "Actualités", description: "Toute la vie des PABO AWARDS : annonces, photos et nouveautés." };

export default async function NewsPage() {
  const news = await getNews(40);
  return (
    <>
      <PageHead kicker="La vie du PABO" title="Actualités" />
      <div className="container-x py-6">
        {news.length === 0 ? (
          <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
            <p className="text-6xl" aria-hidden>📰</p>
            <p className="font-title mt-2 text-3xl uppercase">Pas encore d’actualité</p>
            <p className="mt-1 text-white/70">Reviens bientôt pour les nouveautés.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n, i) => (
              <Reveal key={n.id} delay={(i % 3) * 80} className="h-full"><NewsCard n={n} /></Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
