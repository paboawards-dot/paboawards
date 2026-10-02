import Link from "next/link";
import { Photo } from "./Photo";
import { CopyLinkButton } from "./CopyLinkButton";
import { IconVote } from "./Icons";
import { num } from "@/lib/format";

export type CardCandidate = { id: string; slug: string; name: string; photo_url: string | null; votes_count: number; rank: number };
export type CardCategory = { id: string; name: string; color: string; emoji: string };

export function CandidateCard({ c, cat, canVote = true, showRank = true }: { c: CardCandidate; cat: CardCategory; canVote?: boolean; showRank?: boolean }) {
  const medal = c.rank === 1 ? "🥇" : c.rank === 2 ? "🥈" : c.rank === 3 ? "🥉" : null;
  return (
    <article className="glass group flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1" style={{ boxShadow: `0 18px 40px -22px ${cat.color}` }}>
      <Link href={`/artistes/${c.slug}`} className="relative block aspect-[4/5] overflow-hidden" aria-label={`Voir la fiche de ${c.name}`}>
        <Photo src={c.photo_url} name={c.name} color={cat.color} className="transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
        {showRank && c.votes_count > 0 && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 font-title text-xl text-gold">
            {medal} N°{c.rank}
          </span>
        )}
        <span className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-xs font-bold" style={{ color: "#fff" }}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base" style={{ background: cat.color }} aria-hidden>{cat.emoji}</span>
          <span className="line-clamp-2 text-left leading-tight drop-shadow">{cat.name}</span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-title text-3xl leading-none">
            <Link href={`/artistes/${c.slug}`}>{c.name}</Link>
          </h3>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-title text-3xl text-gold-grad">{num(c.votes_count)}</span>
            <span className="text-sm font-semibold text-white/70">vote{c.votes_count > 1 ? "s" : ""}</span>
          </p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Link href={`/voter/${c.slug}`} className={`btn-vote w-full ${canVote ? "" : "opacity-80"}`}>
            <IconVote size={24} /> Voter
          </Link>
          <CopyLinkButton path={`/artistes/${c.slug}`} small />
        </div>
      </div>
    </article>
  );
}
