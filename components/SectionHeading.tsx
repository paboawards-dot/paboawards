import Link from "next/link";

export function SectionHeading({ kicker, title, href, linkLabel }: { kicker?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {kicker && <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.3em] text-gold">{kicker}</p>}
        <h2 className="section-title">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/10">{linkLabel || "Tout voir"} →</Link>
      )}
    </div>
  );
}
