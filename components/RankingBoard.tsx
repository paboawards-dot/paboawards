"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Photo } from "./Photo";
import { IconDown, IconUp, IconVote } from "./Icons";
import { num } from "@/lib/format";

type Cat = { id: string; slug: string; name: string; color: string; emoji: string };
type Cand = { id: string; slug: string; name: string; photo_url: string | null; category_id: string; votes_count: number };

function rankList(list: Cand[]) {
  const sorted = [...list].sort((a, b) => b.votes_count - a.votes_count || a.name.localeCompare(b.name));
  let rank = 0, last = -1;
  return sorted.map((c, i) => {
    if (c.votes_count !== last) { rank = i + 1; last = c.votes_count; }
    return { ...c, rank };
  });
}

export function RankingBoard({ categories, candidates, initialCategory }: { categories: Cat[]; candidates: Cand[]; initialCategory?: string }) {
  const [cands, setCands] = useState(candidates);
  const [catSlug, setCatSlug] = useState(categories.find((c) => c.slug === initialCategory)?.slug || categories[0]?.slug || "");
  const [moves, setMoves] = useState<Record<string, number>>({});
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [ago, setAgo] = useState(0);
  const prevRanks = useRef<Record<string, number>>({});
  const positions = useRef<Map<string, number>>(new Map());
  const listRef = useRef<HTMLOListElement>(null);

  const cat = categories.find((c) => c.slug === catSlug);
  const ranked = useMemo(() => rankList(cands.filter((c) => c.category_id === cat?.id)), [cands, cat]);

  // mémorise les rangs pour calculer l'évolution à la prochaine mise à jour
  useEffect(() => {
    const m: Record<string, number> = {};
    categories.forEach((k) => rankList(cands.filter((c) => c.category_id === k.id)).forEach((c) => (m[c.id] = c.rank)));
    prevRanks.current = m;
  }, [cands, categories]);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/ranking", { cache: "no-store" });
      if (!r.ok) return;
      const data: { id: string; votes_count: number }[] = await r.json();
      const votes = new Map(data.map((d) => [d.id, d.votes_count]));
      const before = prevRanks.current;
      const next = cands.map((c) => ({ ...c, votes_count: votes.get(c.id) ?? c.votes_count }));
      const after: Record<string, number> = {};
      categories.forEach((k) => rankList(next.filter((c) => c.category_id === k.id)).forEach((c) => (after[c.id] = c.rank)));
      const mv: Record<string, number> = {};
      Object.keys(after).forEach((id) => { if (before[id] && before[id] !== after[id]) mv[id] = before[id] - after[id]; });
      setMoves(mv);
      setCands(next);
      setUpdatedAt(Date.now());
    } catch { /* réseau : on garde l'affichage actuel */ }
  }, [cands, categories]);

  // mise à jour automatique toutes les 30 s (en pause quand l'onglet est caché)
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 30000);
    return () => clearInterval(id);
  }, [refresh]);
  useEffect(() => {
    const id = setInterval(() => setAgo(updatedAt ? Math.round((Date.now() - updatedAt) / 1000) : 0), 1000);
    return () => clearInterval(id);
  }, [updatedAt]);

  // animation FLIP : les lignes glissent vers leur nouvelle position
  useLayoutEffect(() => {
    const ol = listRef.current;
    if (!ol) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    ol.querySelectorAll<HTMLElement>("[data-id]").forEach((el) => {
      const top = el.offsetTop;
      next.set(el.dataset.id!, top);
      const old = positions.current.get(el.dataset.id!);
      if (!reduce && old !== undefined && old !== top) {
        el.style.transition = "none";
        el.style.transform = `translateY(${old - top}px)`;
        requestAnimationFrame(() => {
          el.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1)";
          el.style.transform = "";
        });
      }
    });
    positions.current = next;
  }, [ranked]);

  if (!cat) return <p className="text-center text-white/70">Aucune catégorie.</p>;
  const top3 = ranked.filter((c) => c.rank <= 3).slice(0, 3);
  const order = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3.length === 2 ? [top3[1], top3[0]] : top3;
  const heights: Record<number, string> = { 1: "h-36 sm:h-48", 2: "h-24 sm:h-32", 3: "h-16 sm:h-24" };
  const medal: Record<number, string> = { 1: "from-[#fff3b0] to-[#e08a00]", 2: "from-[#f1f5f9] to-[#94a3b8]", 3: "from-[#fcd5a5] to-[#b45309]" };

  return (
    <div>
      <div className="sticky top-14 z-30 -mx-4 border-b border-white/10 bg-ink/90 px-4 py-3 backdrop-blur-md sm:top-16">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Catégories">
          {categories.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={c.slug === catSlug} className="chip whitespace-nowrap" data-active={c.slug === catSlug} onClick={() => setCatSlug(c.slug)}>
              <span aria-hidden>{c.emoji}</span> {c.name.replace(/^Meilleur(e)? /i, "").replace(/ de l[’']année/i, "").replace(/ du PABO Awards/i, "").slice(0, 30)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="max-w-2xl text-xl font-extrabold leading-tight sm:text-2xl"><span aria-hidden>{cat.emoji}</span> {cat.name}</h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> EN DIRECT{updatedAt ? ` · ${ago}s` : ""}
        </span>
      </div>

      {ranked.length === 0 ? (
        <div className="glass mx-auto mt-8 max-w-md rounded-3xl p-8 text-center">
          <div className="text-6xl" aria-hidden>🏆</div>
          <p className="font-title mt-2 text-3xl uppercase">Pas encore de candidats</p>
          <p className="mt-1 text-white/70">Le classement apparaîtra dès l’arrivée des artistes.</p>
        </div>
      ) : (
        <>
          {/* PODIUM */}
          <div key={cat.id} className="mx-auto mt-8 flex max-w-xl items-end justify-center gap-2 sm:gap-4" aria-label="Podium">
            {order.map((c, i) => (
              <div key={c.id} className="flex w-1/3 flex-col items-center">
                <Link href={`/artistes/${c.slug}`} className="relative mb-2 block pop-bounce" style={{ animationDelay: `${300 + i * 150}ms` }}>
                  {c.rank === 1 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl" aria-hidden>👑</span>}
                  <span className={`relative block overflow-hidden rounded-full border-4 ${c.rank === 1 ? "h-24 w-24 border-gold sm:h-32 sm:w-32" : "h-20 w-20 border-white/70 sm:h-24 sm:w-24"}`}>
                    <Photo src={c.photo_url} name={c.name} color={cat.color} sizes="128px" />
                  </span>
                </Link>
                <p className="line-clamp-2 min-h-[2.4em] text-center text-sm font-extrabold leading-tight sm:text-base">{c.name}</p>
                <p className="font-title text-2xl text-gold-grad">{num(c.votes_count)}</p>
                <div className={`rise flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b ${medal[c.rank] || medal[3]} ${heights[c.rank] || heights[3]}`} style={{ ["--d" as string]: `${i * 150}ms` }}>
                  <span className="font-title mt-2 text-5xl text-black/70 sm:text-6xl">{c.rank}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CLASSEMENT COMPLET */}
          <ol ref={listRef} className="relative mt-8 space-y-2">
            {ranked.map((c) => {
              const mv = moves[c.id] || 0;
              return (
                <li key={c.id} data-id={c.id} className="glass flex items-center gap-3 rounded-2xl p-2.5 pr-3">
                  <span className={`font-title flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-3xl ${c.rank <= 3 ? "bg-gold text-black" : "bg-white/10"}`}>{c.rank}</span>
                  <Link href={`/artistes/${c.slug}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                    <Photo src={c.photo_url} name={c.name} color={cat.color} sizes="56px" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-extrabold leading-tight">{c.name}</p>
                    <p className="flex items-center gap-2 text-sm font-semibold text-white/70">
                      <span><b className="font-title text-2xl text-gold">{num(c.votes_count)}</b> vote{c.votes_count > 1 ? "s" : ""}</span>
                      {mv !== 0 && (
                        <span className={`inline-flex items-center text-xs font-bold ${mv > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {mv > 0 ? <IconUp size={16} /> : <IconDown size={16} />}{Math.abs(mv)}
                        </span>
                      )}
                    </p>
                  </div>
                  <Link href={`/voter/${c.slug}`} className="btn-vote !min-h-[48px] !rounded-xl !px-4 !text-lg" aria-label={`Voter pour ${c.name}`}>
                    <IconVote size={20} /> <span className="hidden sm:inline">Voter</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
