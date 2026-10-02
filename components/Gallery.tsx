import Image from "next/image";

/** Carrousel d'images (défilement tactile) — images uniquement, jamais de vidéo. */
export function Gallery({ images, alt, ratio = "aspect-[4/3]" }: { images: string[]; alt: string; ratio?: string }) {
  if (!images.length) return null;
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-3xl" aria-label={`Galerie : ${alt}`}>
      {images.map((src, i) => (
        <div key={src + i} className={`relative ${ratio} w-[88%] shrink-0 snap-center overflow-hidden rounded-3xl bg-white/5 sm:w-[60%] ${images.length === 1 ? "!w-full" : ""}`}>
          <Image src={src} alt={`${alt} — image ${i + 1}`} fill sizes="(max-width:640px) 88vw, 600px" className="object-cover" loading={i === 0 ? "eager" : "lazy"} />
        </div>
      ))}
    </div>
  );
}
