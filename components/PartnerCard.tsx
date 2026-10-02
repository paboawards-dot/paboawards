import Image from "next/image";
import type { Partner } from "@/lib/types";

export function PartnerCard({ p }: { p: Partner }) {
  return (
    <article className="glass flex h-full flex-col overflow-hidden rounded-3xl">
      <div className="relative flex aspect-[16/10] items-center justify-center bg-white/95 p-4">
        {p.logo_url ? <Image src={p.logo_url} alt={`Logo ${p.name}`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-contain p-4" /> : <span className="font-title text-4xl text-black">{p.name}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="text-xl font-extrabold leading-tight">{p.name}</h3>
        {p.role && <p className="text-sm font-bold uppercase tracking-widest text-gold">{p.role}</p>}
        {p.description && <p className="mt-1 text-white/70">{p.description}</p>}
      </div>
      {p.images.length > 0 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-5">
          {p.images.map((src, i) => (
            <div key={src + i} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-white/10">
              <Image src={src} alt={`${p.name} — image ${i + 1}`} fill sizes="112px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
