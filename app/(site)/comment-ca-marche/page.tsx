import type { Metadata } from "next";
import Link from "next/link";
import { HowItWorks } from "@/components/HowItWorks";
import { PageHead } from "@/components/PageHead";
import { PayLogo } from "@/components/PayLogo";
import { METHODS, PACKS } from "@/lib/config";
import { fcfa, num } from "@/lib/format";

export const metadata: Metadata = { title: "Comment ça marche ?", description: "Voter aux PABO AWARDS en 4 étapes : choisis, compte, paye, partage." };

export default function HowPage() {
  return (
    <>
      <PageHead kicker="4 étapes" title="Comment ça marche ?" text="Voter prend moins d’une minute." />
      <div className="container-x space-y-10 py-6">
        <HowItWorks />
        <section className="glass rounded-3xl p-6">
          <h2 className="section-title">Le prix des votes</h2>
          <p className="mt-1 text-lg text-white/75">100 FCFA = 1 vote. Tu peux aussi choisir ta propre quantité.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PACKS.map((p) => (
              <div key={p} className="rounded-2xl bg-white/5 p-3 text-center">
                <p className="font-title text-4xl text-gold-grad">{num(p)}</p>
                <p className="text-xs font-bold uppercase text-white/70">vote{p > 1 ? "s" : ""}</p>
                <p className="mt-1 font-extrabold">{fcfa(p * 100)}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="section-title">Les moyens de paiement</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {METHODS.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-2 text-center">
                <PayLogo id={m.id} size={80} />
                <p className="font-bold">{m.name}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="glass rounded-3xl p-6">
          <h2 className="section-title">Bon à savoir</h2>
          <ul className="mt-3 space-y-2 text-lg text-white/85">
            <li>✅ Ton vote est compté seulement quand le paiement est confirmé.</li>
            <li>🧾 Tu reçois une carte de vote à partager et à télécharger.</li>
            <li>🔁 Tu peux voter plusieurs fois, pour le même artiste ou pour d’autres.</li>
            <li>📈 Le classement se met à jour en direct.</li>
          </ul>
        </section>
        <div className="text-center"><Link href="/voter" className="btn-vote w-full max-w-sm !min-h-[64px] !text-3xl">Voter maintenant</Link></div>
      </div>
    </>
  );
}
