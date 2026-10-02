import Link from "next/link";
import Image from "next/image";
import type { News } from "@/lib/types";
import { dateFr } from "@/lib/format";

export function NewsCard({ n }: { n: News }) {
  return (
    <Link href={`/actualites/${n.id}`} className="glass group flex h-full flex-col overflow-hidden rounded-3xl transition hover:-translate-y-1">
      <div className="relative aspect-[16/10] bg-gradient-to-br from-violet/40 to-electric/40">
        {n.images[0] && <Image src={n.images[0]} alt={n.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />}
        {n.images.length > 1 && <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold">{n.images.length} photos</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">{dateFr(n.published_at)}</p>
        <h3 className="text-xl font-extrabold leading-tight">{n.title}</h3>
        {n.body && <p className="line-clamp-3 text-white/70">{n.body}</p>}
      </div>
    </Link>
  );
}
