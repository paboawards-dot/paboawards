import Link from "next/link";
import Image from "next/image";
import { Logo } from "./Logo";
import { Trophy } from "./Trophy";
import { IconArrow, IconVote } from "./Icons";
import type { RankedCandidate, Category } from "@/lib/types";

type Tile = { src: string | null; label: string; color: string; emoji: string };

export function Hero({ candidates, categories }: { candidates: RankedCandidate[]; categories: Category[] }) {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const withPhoto = [...candidates].filter((c) => c.photo_url).sort((a, b) => b.votes_count - a.votes_count).slice(0, 8);
  const tiles: Tile[] = withPhoto.map((c) => ({ src: c.photo_url, label: c.name, color: catById.get(c.category_id)?.color || "#8b5cf6", emoji: catById.get(c.category_id)?.emoji || "🎤" }));
  // Images de la compétition en renfort
  const fillers: Tile[] = [
    { src: "/competition/flyer.jpg", label: "Affiche PABO AWARDS", color: "#ff5a3c", emoji: "🏆" },
    { src: "/competition/trophee.jpg", label: "Le trophée PABO AWARDS", color: "#ffc94a", emoji: "🏆" },
  ];
  const emojis = categories.map((c) => ({ src: null, label: c.name, color: c.color, emoji: c.emoji }));
  const all: Tile[] = [...tiles, ...fillers, ...emojis].slice(0, 9);
  while (all.length < 9) all.push({ src: null, label: "PABO", color: "#8b5cf6", emoji: "🎤" });
  const rot = ["-rotate-3", "rotate-2", "rotate-3", "-rotate-2"];

  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div className="halo -left-24 top-0 h-80 w-80 bg-violet" />
      <div className="halo -right-24 top-40 h-80 w-80 bg-electric" />
      <div className="halo bottom-0 left-1/3 h-72 w-72 bg-coral" />
      <div className="fx absolute inset-x-0 bottom-0 top-0 -z-10" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="particle" style={{ left: `${(i * 83) % 100}%`, animationDelay: `${(i * 0.9) % 7}s`, animationDuration: `${6 + (i % 4)}s` }} />
        ))}
      </div>

      <div className="container-x grid items-center gap-8 pb-10 pt-8 lg:grid-cols-2 lg:pb-20 lg:pt-14">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="mb-4 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em]">Esprit Guerrier présente</span>
          <h1 id="hero-title" className="sr-only">PABO AWARDS — Vote pour ton artiste du Bounkani</h1>
          <Logo size="lg" href={null} />
          <p className="font-title mt-6 text-4xl uppercase leading-[0.95] sm:text-6xl">
            Vote pour ton artiste <span className="text-rainbow">du Bounkani</span>
          </p>
          <p className="mt-3 text-lg font-semibold text-white/80 sm:text-xl">La voix du public. Le talent du Bounkani.</p>
          <div className="mt-7 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
            <Link href="/voter" className="btn-vote !min-h-[64px] !text-3xl sm:min-w-[300px] animate-pulseGlow">
              <IconVote size={30} /> Voter maintenant
            </Link>
            <Link href="/artistes" className="btn-ghost !min-h-[64px] !text-lg">
              Découvrir les artistes <IconArrow size={20} />
            </Link>
          </div>
        </div>

        {/* Mosaïque d'artistes + trophée */}
        <div className="relative mx-auto w-full max-w-md" aria-hidden={false}>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {all.map((t, i) => {
              const center = i === 4;
              return center ? (
                <div key={i} className="relative flex items-center justify-center">
                  <Trophy className="z-10 h-full w-full animate-floaty p-1" />
                </div>
              ) : (
                <div key={i} className={`glass relative aspect-[3/4] overflow-hidden rounded-2xl ${rot[i % 4]} transition duration-500 hover:z-20 hover:scale-110 hover:rotate-0`} style={{ boxShadow: `0 14px 30px -14px ${t.color}`, animation: i % 2 ? "floaty 7s ease-in-out infinite" : "floaty 9s ease-in-out infinite reverse" }}>
                  {t.src ? (
                    <Image src={t.src} alt={t.label} fill sizes="(max-width:640px) 30vw, 160px" priority={i < 3} className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl" style={{ background: `linear-gradient(145deg, ${t.color}, #150b2e)` }}>{t.emoji}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="pattern-band" aria-hidden />
    </section>
  );
}
