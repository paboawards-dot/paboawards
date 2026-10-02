import Image from "next/image";
import { initials } from "@/lib/format";

/** Photo avec repli élégant (initiales) si aucune image n'est disponible. */
export function Photo({ src, name, color = "#8b5cf6", sizes = "(max-width:640px) 50vw, 25vw", priority = false, className = "" }: { src: string | null; name: string; color?: string; sizes?: string; priority?: boolean; className?: string }) {
  if (!src) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${className}`} style={{ background: `linear-gradient(145deg, ${color}, #150b2e)` }} aria-label={name} role="img">
        <span className="font-title text-6xl text-white/90">{initials(name)}</span>
      </div>
    );
  }
  return <Image src={src} alt={`Photo de ${name}`} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}
