"use client";
import { useMemo, useState } from "react";
import { CandidateCard, type CardCandidate } from "./CandidateCard";
import { IconSearch } from "./Icons";

type Cat = { id: string; slug: string; name: string; color: string; emoji: string };

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ArtistExplorer({ candidates, categories, gates, initialCategory = "" }: { candidates: (CardCandidate & { category_id: string })[]; categories: Cat[]; gates: Record<string, boolean>; initialCategory?: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(initialCategory);
  const [limit, setLimit] = useState(24);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const list = useMemo(() => {
    const nq = norm(q.trim());
    const selected = categories.find((c) => c.slug === cat);
    return candidates.filter((c) => (!selected || c.category_id === selected.id) && (!nq || norm(c.name).includes(nq)));
  }, [candidates, categories, q, cat]);

  return (
    <div>
      <div className="sticky top-14 z-30 -mx-4 space-y-3 border-b border-white/10 bg-ink/90 px-4 py-3 backdrop-blur-md sm:top-16 sm:mx-0 sm:rounded-2xl sm:border">
        <label className="relative block">
          <span className="sr-only">Rechercher un artiste</span>
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setLimit(24); }}
            placeholder="Chercher un artiste…"
            className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-4 text-lg text-white placeholder:text-white/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </label>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filtrer par catégorie">
          <button type="button" className="chip" data-active={cat === ""} onClick={() => { setCat(""); setLimit(24); }}>🏆 Toutes</button>
          {categories.map((c) => (
            <button key={c.id} type="button" className="chip whitespace-nowrap" data-active={cat === c.slug} onClick={() => { setCat(c.slug); setLimit(24); }}>
              <span aria-hidden>{c.emoji}</span> {shortName(c.name)}
            </button>
          ))}
        </div>
      </div>

      {candidates.length === 0 ? (
        <Empty icon="🎤" title="Les artistes arrivent bientôt" text="Les candidats seront présentés très prochainement." />
      ) : list.length === 0 ? (
        <Empty icon="🔎" title="Aucun résultat" text="Essaie un autre nom ou une autre catégorie." />
      ) : (
        <>
          <p className="mt-4 text-sm font-semibold text-white/70" aria-live="polite">{list.length} artiste{list.length > 1 ? "s" : ""}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {list.slice(0, limit).map((c) => {
              const ct = catById.get(c.category_id);
              if (!ct) return null;
              return <CandidateCard key={c.id} c={c} cat={ct} canVote={gates[c.category_id] !== false} />;
            })}
          </div>
          {list.length > limit && (
            <div className="mt-8 text-center">
              <button type="button" className="btn-ghost" onClick={() => setLimit((l) => l + 24)}>Voir plus d’artistes</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Empty({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="glass mx-auto mt-8 max-w-md rounded-3xl p-8 text-center">
      <div className="text-6xl" aria-hidden>{icon}</div>
      <p className="font-title mt-2 text-3xl uppercase">{title}</p>
      <p className="mt-1 text-white/70">{text}</p>
    </div>
  );
}

function shortName(n: string) {
  return n.replace(/^Meilleur(e)? /i, "").replace(/ de l[’']année/i, "").replace(/ du PABO Awards/i, "").slice(0, 34);
}
