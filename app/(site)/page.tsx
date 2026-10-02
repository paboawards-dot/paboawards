import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/Hero";
import { Countdown } from "@/components/Countdown";
import { CategoryDiscovery } from "@/components/CategoryDiscovery";
import { CandidateCard } from "@/components/CandidateCard";
import { StatCounter } from "@/components/StatCounter";
import { NewsCard } from "@/components/NewsCard";
import { HowItWorks } from "@/components/HowItWorks";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Photo } from "@/components/Photo";
import { getCandidates, getCategories, getNews, getPartners, getSettings, getStats, getUniverses } from "@/lib/data";
import { voteGate } from "@/lib/status";
import { num } from "@/lib/format";

export const revalidate = 30;

export default async function HomePage() {
  const [settings, universes, categories, candidates, stats, news, partners] = await Promise.all([
    getSettings(), getUniverses(), getCategories(), getCandidates(), getStats(), getNews(3), getPartners(),
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const counts: Record<string, number> = {};
  candidates.forEach((c) => (counts[c.category_id] = (counts[c.category_id] || 0) + 1));
  const gates: Record<string, boolean> = {};
  categories.forEach((c) => (gates[c.id] = voteGate(c, settings).ok));

  const featured = [...candidates].sort((a, b) => b.votes_count - a.votes_count || a.name.localeCompare(b.name)).slice(0, 8);
  const leaders = categories
    .map((cat) => ({ cat, lead: candidates.filter((c) => c.category_id === cat.id && c.votes_count > 0).sort((a, b) => b.votes_count - a.votes_count)[0] }))
    .filter((x) => x.lead);

  return (
    <>
      <Hero candidates={candidates} categories={categories} />

      {/* Compte à rebours + statut */}
      <section className="container-x py-10" aria-label="Statut du concours">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10">
            <div className="halo -right-10 -top-10 h-48 w-48 bg-gold" style={{ opacity: 0.25 }} />
            <Countdown votes_enabled={settings?.votes_enabled ?? true} votes_open_at={settings?.votes_open_at ?? null} votes_close_at={settings?.votes_close_at ?? null} ceremony_at={settings?.ceremony_at ?? null} />
          </div>
        </Reveal>
      </section>

      {/* Catégories */}
      <section className="container-x py-8" aria-labelledby="cats">
        <SectionHeading kicker="15 catégories" title="Trouve ta catégorie" href="/categories" linkLabel="Les 15 catégories" />
        <span id="cats" className="sr-only">Catégories</span>
        {categories.length ? (
          <CategoryDiscovery universes={universes} categories={categories} counts={counts} />
        ) : (
          <p className="glass rounded-3xl p-8 text-center text-white/70">Les catégories arrivent bientôt.</p>
        )}
      </section>

      {/* Artistes */}
      <section className="container-x py-8">
        <SectionHeading kicker="À soutenir" title="Les artistes" href="/artistes" linkLabel="Tous les artistes" />
        {featured.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((c, i) => {
              const cat = catById.get(c.category_id);
              return cat ? (
                <Reveal key={c.id} delay={(i % 4) * 80} className="h-full">
                  <CandidateCard c={c} cat={cat} canVote={gates[c.category_id]} />
                </Reveal>
              ) : null;
            })}
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-6xl">🎤</p>
            <p className="font-title mt-2 text-3xl uppercase">Les artistes arrivent bientôt</p>
            <p className="mt-1 text-white/70">Les sélections sont en cours. Reviens très vite !</p>
          </div>
        )}
      </section>

      {/* Classement */}
      <section className="container-x py-8">
        <SectionHeading kicker="En direct" title="Qui est en tête ?" href="/classement" linkLabel="Voir le classement" />
        {leaders.length ? (
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {leaders.map(({ cat, lead }) => (
              <Link key={cat.id} href={`/classement?c=${cat.slug}`} className="glass relative w-[240px] shrink-0 snap-start overflow-hidden rounded-3xl p-4 transition hover:-translate-y-1" style={{ boxShadow: `0 16px 36px -22px ${cat.color}` }}>
                <p className="line-clamp-2 min-h-[2.6em] text-sm font-bold text-white/80"><span aria-hidden>{cat.emoji}</span> {cat.name}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gold"><Photo src={lead!.photo_url} name={lead!.name} color={cat.color} sizes="64px" /></span>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-extrabold">👑 {lead!.name}</p>
                    <p className="font-title text-3xl text-gold-grad">{num(lead!.votes_count)} <span className="text-sm font-sans font-bold text-white/70">votes</span></p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-6xl">🏆</p>
            <p className="font-title mt-2 text-3xl uppercase">Le classement démarre avec les votes</p>
            <Link href="/voter" className="btn-vote mt-5 w-full max-w-xs">Voter</Link>
          </div>
        )}
      </section>

      {/* Statistiques publiques (jamais de montants) */}
      <section className="container-x py-8" aria-label="Chiffres du concours">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCounter value={stats.votes} label="Votes" icon="🗳️" />
          <StatCounter value={stats.voters} label="Votants" icon="🙌" />
          <StatCounter value={stats.artists || candidates.length} label="Artistes" icon="🎤" />
          <StatCounter value={stats.categories || categories.length} label="Catégories" icon="🏆" />
        </div>
      </section>

      {/* Actualités */}
      {news.length > 0 && (
        <section className="container-x py-8">
          <SectionHeading kicker="La vie du PABO" title="Actualités" href="/actualites" />
          <div className="grid gap-4 md:grid-cols-3">
            {news.map((n, i) => (
              <Reveal key={n.id} delay={i * 90} className="h-full"><NewsCard n={n} /></Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Partenaires */}
      {partners.length > 0 && (
        <section className="container-x py-8">
          <SectionHeading kicker="Ils soutiennent" title="Partenaires" href="/partenaires" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {partners.map((p) => (
              <div key={p.id} className="glass flex flex-col items-center gap-2 rounded-2xl p-3 text-center">
                <div className="relative h-24 w-full overflow-hidden rounded-xl bg-white">
                  {p.logo_url && <Image src={p.logo_url} alt={`Logo ${p.name}`} fill sizes="200px" className="object-contain p-2" />}
                </div>
                <p className="text-sm font-extrabold leading-tight">{p.name}</p>
                {p.role && <p className="text-xs font-bold uppercase tracking-wider text-gold">{p.role}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comment ça marche */}
      <section className="container-x py-8">
        <SectionHeading kicker="Simple comme bonjour" title="Comment voter ?" href="/comment-ca-marche" linkLabel="En savoir plus" />
        <HowItWorks />
      </section>
    </>
  );
}
