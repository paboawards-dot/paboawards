"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { IconClose, IconHome, IconMenu, IconTrophy, IconUsers, IconVote } from "./Icons";

const MAIN = [
  { href: "/", label: "Accueil" },
  { href: "/categories", label: "Catégories" },
  { href: "/artistes", label: "Artistes" },
  { href: "/classement", label: "Classement" },
  { href: "/actualites", label: "Actualités" },
  { href: "/comment-ca-marche", label: "Comment ça marche ?" },
  { href: "/reglement", label: "Règlement" },
  { href: "/a-propos", label: "À propos" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/contact", label: "Contact" },
];

const DESKTOP = MAIN.filter((l) => ["/", "/categories", "/artistes", "/classement", "/actualites", "/comment-ca-marche"].includes(l.href));

export function NavShell() {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const tab = (href: string, label: string, Icon: typeof IconHome) => (
    <Link href={href} className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${active(href) ? "text-gold" : "text-white/70"}`} aria-current={active(href) ? "page" : undefined}>
      <Icon size={24} />
      {label}
    </Link>
  );

  return (
    <>
      {/* Barre du haut */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-md">
        <div className="container-x flex h-14 items-center justify-between sm:h-16">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
            {DESKTOP.map((l) => (
              <Link key={l.href} href={l.href} className={`rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-white/10 ${active(l.href) ? "text-gold" : "text-white/80"}`}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/voter" className="btn-vote !min-h-[44px] !rounded-xl !px-4 !text-lg">
              <IconVote size={20} /> Voter
            </Link>
            <button type="button" onClick={() => setOpen(true)} className="btn-ghost !min-h-[44px] !px-3" aria-label="Ouvrir le menu">
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Menu complet */}
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-label="Fermer le menu" />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col gap-1 overflow-y-auto bg-night p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <Logo href={null} />
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost !min-h-[44px] !px-3" aria-label="Fermer">
                <IconClose />
              </button>
            </div>
            {MAIN.map((l) => (
              <Link key={l.href} href={l.href} className={`rounded-xl px-4 py-3.5 text-lg font-semibold transition hover:bg-white/10 ${active(l.href) ? "bg-white/10 text-gold" : ""}`}>
                {l.label}
              </Link>
            ))}
            <Link href="/voter" className="btn-vote mt-4">
              <IconVote size={26} /> Voter maintenant
            </Link>
          </div>
        </div>
      )}

      {/* Navigation mobile : accès rapide au parcours de vote */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink/90 backdrop-blur-lg lg:hidden" aria-label="Navigation mobile">
        <div className="mx-auto flex max-w-xl items-end px-2">
          {tab("/", "Accueil", IconHome)}
          {tab("/artistes", "Artistes", IconUsers)}
          <Link href="/voter" className="relative -mt-6 flex flex-1 flex-col items-center" aria-label="Voter">
            <span className="btn-vote !min-h-[64px] !w-[64px] !rounded-full !px-0 animate-pulseGlow">
              <IconVote size={32} />
            </span>
            <span className="mt-0.5 text-[11px] font-bold text-gold">VOTER</span>
          </Link>
          {tab("/classement", "Classement", IconTrophy)}
          <button type="button" onClick={() => setOpen(true)} className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-white/70">
            <IconMenu size={24} />
            Menu
          </button>
        </div>
      </nav>
    </>
  );
}
