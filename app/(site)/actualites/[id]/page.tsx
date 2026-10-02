import type { Metadata } from "next";
import Link from "next/link";
import { Gallery } from "@/components/Gallery";
import { StateScreen } from "@/components/StateScreen";
import { getNewsItem } from "@/lib/data";
import { dateFr } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const n = await getNewsItem(params.id);
  if (!n) return { title: "Actualité introuvable" };
  return { title: n.title, description: (n.body || "").slice(0, 150), openGraph: { title: n.title, images: n.images[0] ? [n.images[0]] : undefined } };
}

export default async function NewsItemPage({ params }: { params: { id: string } }) {
  const n = /^[0-9a-f-]{36}$/i.test(params.id) ? await getNewsItem(params.id) : null;
  if (!n) {
    return (
      <StateScreen icon="📰" title="Actualité introuvable" text="Cette actualité n’existe pas ou a été retirée.">
        <Link href="/actualites" className="btn-vote">Voir les actualités</Link>
      </StateScreen>
    );
  }
  return (
    <article className="container-x max-w-3xl py-10">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">{dateFr(n.published_at)}</p>
      <h1 className="font-title mt-2 text-5xl uppercase leading-none sm:text-6xl">{n.title}</h1>
      <div className="mt-6"><Gallery images={n.images} alt={n.title} ratio="aspect-[16/10]" /></div>
      {n.body && <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-white/85">{n.body}</p>}
      <Link href="/actualites" className="btn-ghost mt-8">← Toutes les actualités</Link>
    </article>
  );
}
