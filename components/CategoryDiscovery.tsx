"use client";
import { useState } from "react";
import { CategoryCard } from "./CategoryCard";
import type { Category, Universe } from "@/lib/types";

export function CategoryDiscovery({ universes, categories, counts }: { universes: Universe[]; categories: Category[]; counts: Record<string, number> }) {
  const [u, setU] = useState(universes[0]?.id ?? 0);
  const current = universes.find((x) => x.id === u);
  return (
    <div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2" role="tablist" aria-label="Univers de catégories">
        {universes.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={u === x.id} onClick={() => setU(x.id)} className="chip !min-h-[52px] whitespace-nowrap !text-base" data-active={u === x.id} style={u === x.id ? undefined : { borderColor: x.color }}>
            <span className="h-3 w-3 rounded-full" style={{ background: x.color }} /> {x.name}
          </button>
        ))}
      </div>
      {current?.tagline && <p className="mt-3 text-white/70">{current.tagline}</p>}
      <div key={u} className="mt-4 grid animate-popIn grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {categories.filter((c) => c.universe_id === u).map((c) => (
          <CategoryCard key={c.id} cat={c} count={counts[c.id] ?? 0} />
        ))}
      </div>
    </div>
  );
}
