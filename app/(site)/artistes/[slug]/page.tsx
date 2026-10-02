import type { Metadata } from "next";
import Link from "next/link";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { Gallery } from "@/components/Gallery";
import { IconVote } from "@/components/Icons";
import { Photo } from "@/components/Photo";
import { ShareButtons } from "@/components/ShareButtons";
import { StateScreen } from "@/components/StateScreen";
import { ContestBanner } from "@/components/ContestBanner";
import { getCandidateBySlug, getCategories, getSettings } from "@/lib/data";
import { voteGate } from "@/lib/status";
import { num } from "@/lib/format";

export const revalidate = 20;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [cand, categories] = await Promise.all([getCandidateBySlug(params.slug), getCategories()]);
  if (!cand) return { title: "Artiste introuvable" };
  const cat = categories.find((c) => c.id === cand.category_id);
  const title = `Vote pour ${cand.name}${cat ? ` — ${cat.name}` : ""}`;
  const description = `${cand.name} est candidat(e) aux PABO AWARDS, Prix de l’Art du Bounkani. Soutiens-le avec ton vote : 100 FCFA = 1 vote.`;
  return { title, description, openGraph: { title, description, type: "profile" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function ArtistPage({ params }: { params: { slug: string } }) {
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
  const open = voteGate(cat, settings).ok;
  const infoLines = (cand.info || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const path = `/artistes/${cand.slug}`;

  return (
    <>
      <ContestBanner settings={settings} />
      <article className="container-x grid gap-8 py-8 lg:grid-cols-2 lg:py-12">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[2rem] border-4 lg:mx-0" style={{ borderColor: cat.color, boxShadow: `0 30px 80px -30px ${cat.color}` }}>
          <Photo src={cand.photo_url} name={cand.name} color={cat.color} sizes="(max-width:1024px) 100vw, 520px" priority />
          {cand.votes_count > 0 && (
            <span className="font-title absolute left-4 top-4 rounded-full bg-black/75 px-4 py-1 text-3xl text-gold">{cand.rank === 1 ? "👑 " : ""}N°{cand.rank}</span>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Link href={`/artistes?c=${cat.slug}`} className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold" style={{ background: cat.color }}>
            <span aria-hidden>{cat.emoji}</span> {cat.name}
          </Link>
          <h1 className="font-title text-6xl uppercase leading-[0.95] sm:text-8xl">{cand.name}</h1>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-4 text-center">
              <p className="font-title text-5xl text-gold-grad">{num(cand.votes_count)}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-white/70">vote{cand.votes_count > 1 ? "s" : ""}</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <p className="font-title text-5xl">{cand.votes_count > 0 ? `N°${cand.rank}` : "—"}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-white/70">classement</p>
            </div>
          </div>

          {cand.bio && <p className="whitespace-pre-line text-lg leading-relaxed text-white/85">{cand.bio}</p>}
          {infoLines.length > 0 && (
            <ul className="glass space-y-1 rounded-2xl p-4 text-white/85">
              {infoLines.map((l, i) => <li key={i}>• {l}</li>)}
            </ul>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={`/voter/${cand.slug}`} className={`btn-vote !min-h-[64px] sm:col-span-2 ${open ? "animate-pulseGlow" : ""}`}><IconVote size={28} /> Voter</Link>
            <CopyLinkButton path={path} className="btn-ghost sm:col-span-2" />
          </div>
          <ShareButtons path={path} text={`Soutiens ${cand.name} aux PABO AWARDS !`} />
        </div>
      </article>

      {cand.gallery.length > 0 && (
        <section className="container-x pb-8">
          <h2 className="section-title mb-4">Galerie</h2>
          <Gallery images={cand.gallery} alt={cand.name} ratio="aspect-[4/5]" />
        </section>
      )}
    </>
  );
}
