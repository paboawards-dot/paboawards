import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryCard({ cat, count, href }: { cat: Pick<Category, "slug" | "name" | "color" | "emoji" | "image_url">; count?: number; href?: string }) {
  return (
    <Link
      href={href || `/artistes?c=${cat.slug}`}
      className="group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-3xl p-4 transition duration-300 hover:-translate-y-1 active:scale-[0.98]"
      style={{ background: `linear-gradient(145deg, ${cat.color} 0%, #150b2e 120%)`, boxShadow: `0 18px 40px -22px ${cat.color}` }}
    >
      {cat.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cat.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay" loading="lazy" />
      )}
      <div className="pattern-band absolute inset-x-0 top-0 opacity-40" aria-hidden />
      <div className="fx halo -right-6 -top-6 h-28 w-28" style={{ background: "#fff", opacity: 0.25 }} />
      <span className="relative text-6xl drop-shadow-lg transition duration-300 group-hover:scale-110 group-hover:-rotate-6" aria-hidden>{cat.emoji}</span>
      <div className="relative">
        <h3 className="line-clamp-3 text-[1.05rem] font-extrabold leading-tight text-white drop-shadow">{cat.name}</h3>
        <div className="mt-2 flex items-center justify-between text-sm font-bold text-white/90">
          <span>{typeof count === "number" ? `${count} candidat${count > 1 ? "s" : ""}` : ""}</span>
          <span className="rounded-full bg-black/35 px-3 py-1">Voir →</span>
        </div>
      </div>
    </Link>
  );
}
