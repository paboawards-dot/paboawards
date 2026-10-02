import Link from "next/link";
import Image from "next/image";
import { Logo } from "./Logo";
import { getSettings } from "@/lib/data";

export async function Footer() {
  const s = await getSettings();
  const phone = s?.contact_phone || "+225 07 18 27 57 97";
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40 pb-28 pt-10 lg:pb-10">
      <div className="pattern-band mb-10" aria-hidden />
      <div className="container-x grid gap-10 md:grid-cols-3">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-white/70">Prix de l’Art du Bounkani — première édition. La voix du public. Le talent du Bounkani.</p>
          <div className="flex items-center gap-3">
            <Image src="/partners/esprit-guerrier.jpg" alt="Esprit Guerrier" width={64} height={64} className="rounded-lg bg-white" />
            <p className="text-sm text-white/70">Présenté par<br /><strong className="text-white">Esprit Guerrier</strong></p>
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm" aria-label="Liens du pied de page">
          {[
            ["/categories", "Catégories"], ["/artistes", "Artistes"], ["/classement", "Classement"], ["/actualites", "Actualités"],
            ["/comment-ca-marche", "Comment ça marche ?"], ["/reglement", "Règlement"], ["/a-propos", "À propos"], ["/partenaires", "Partenaires"], ["/contact", "Contact"],
          ].map(([h, l]) => (
            <Link key={h} href={h} className="rounded-lg py-2 text-white/80 hover:text-gold">{l}</Link>
          ))}
        </nav>
        <div className="space-y-2 text-sm text-white/80">
          <p className="font-semibold text-white">Contact</p>
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="block py-1 hover:text-gold">{phone}</a>
          <p>Facebook : PABO AWARDS</p>
          <p>Bounkani, Côte d’Ivoire</p>
          <p className="pt-2 text-white/60">En partenariat technique avec <strong className="text-white/80">EMPIRE D’OR</strong></p>
        </div>
      </div>
      <p className="container-x mt-8 text-xs text-white/40">© {new Date().getFullYear()} PABO AWARDS — Tous droits réservés.</p>
    </footer>
  );
}
