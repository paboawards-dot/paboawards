import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { signOutAdmin } from "../actions";

const LINKS = [
  ["/admin", "Tableau de bord"],
  ["/admin/candidats", "Candidats"],
  ["/admin/categories", "Catégories"],
  ["/admin/actualites", "Actualités"],
  ["/admin/partenaires", "Partenaires"],
  ["/admin/transactions", "Transactions"],
  ["/admin/journal", "Journal"],
  ["/admin/parametres", "Paramètres"],
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:block">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">PABO AWARDS</p>
            <p className="text-lg font-extrabold">Administration</p>
          </div>
          <Link href="/" target="_blank" className="text-sm font-semibold text-indigo-600 lg:mt-2 lg:block">Voir le site ↗</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3" aria-label="Administration">
          {LINKS.map(([h, l]) => (
            <Link key={h} href={h} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">{l}</Link>
          ))}
        </nav>
        <form action={signOutAdmin} className="hidden px-4 pb-4 lg:block">
          <p className="mb-2 truncate text-xs text-slate-500">{admin.email}</p>
          <button type="submit" className="adm-btn-ghost w-full">Se déconnecter</button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
