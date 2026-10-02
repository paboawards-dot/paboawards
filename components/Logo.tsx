import Link from "next/link";
import { Trophy } from "./Trophy";

export function Logo({ size = "sm", href = "/" }: { size?: "sm" | "lg"; href?: string | null }) {
  const inner =
    size === "lg" ? (
      <div className="flex flex-col items-center leading-none">
        <span className="font-title text-gold-grad text-[5.5rem] sm:text-[8rem]" style={{ textShadow: "0 6px 40px rgba(255,154,31,.35)" }}>PABO</span>
        <span className="font-title -mt-3 text-[3.2rem] tracking-[0.12em] text-white sm:text-[5rem]">AWARDS</span>
        <span className="mt-2 rounded-full border border-gold/40 bg-black/30 px-4 py-1 text-[0.65rem] font-semibold tracking-[0.3em] text-gold sm:text-xs">PRIX DE L’ART DU BOUNKANI</span>
      </div>
    ) : (
      <span className="flex items-center gap-2">
        <Trophy className="h-9 w-7" glow={false} />
        <span className="flex flex-col leading-none">
          <span className="font-title text-gold-grad text-2xl">PABO</span>
          <span className="font-title -mt-0.5 text-sm tracking-[0.25em] text-white">AWARDS</span>
        </span>
      </span>
    );
  if (!href) return inner;
  return (
    <Link href={href} aria-label="PABO AWARDS — accueil">
      {inner}
    </Link>
  );
}
