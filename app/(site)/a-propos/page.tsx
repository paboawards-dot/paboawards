import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { getSettings } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "À propos", description: "PABO Awards — Prix de l’Art du Bounkani, présenté par Esprit Guerrier." };

export default async function AboutPage() {
  const s = await getSettings();
  const phone = s?.contact_phone || "+225 07 18 27 57 97";
  return (
    <>
      <PageHead kicker="Prix de l’Art du Bounkani" title="À propos de nous" />
      <div className="container-x grid gap-8 py-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed text-white/85">
          <p>Les <strong className="text-white">PABO Awards</strong> sont un événement annuel de récompenses qui célèbre les talents artistiques, culturels, numériques et entrepreneuriaux de la région du Bounkani, ainsi que les personnalités et structures qui contribuent à son rayonnement.</p>
          <p>L’événement récompense <strong className="text-white">15 catégories</strong>, réparties entre musique, création de contenu digital, nightlife/business, scène/prestation et rayonnement international. Le vainqueur de chaque catégorie est désigné exclusivement par vote public en ligne : chaque vote coûte 100 FCFA, et le classement est visible en temps réel pendant toute la période de vote.</p>
          <p>Les PABO Awards sont présentés par <strong className="text-white">Esprit Guerrier</strong>, et organisés en partenariat technique avec <strong className="text-white">EMPIRE D’OR</strong>, structure en charge de la gestion et de la sécurisation du système de vote et de paiement.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/voter" className="btn-vote">Voter</Link>
            <Link href="/reglement" className="btn-ghost">Lire le règlement</Link>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="glass flex items-center gap-4 rounded-3xl p-5">
            <Image src="/partners/esprit-guerrier.jpg" alt="Logo Esprit Guerrier" width={96} height={96} className="rounded-xl bg-white" />
            <div><p className="text-sm font-bold uppercase tracking-widest text-gold">Présenté par</p><p className="text-2xl font-extrabold">Esprit Guerrier</p></div>
          </div>
          <div className="glass flex items-center gap-4 rounded-3xl p-5">
            <Image src="/partners/empire-dor.jpg" alt="Logo EMPIRE D’OR" width={96} height={96} className="rounded-xl bg-black" />
            <div><p className="text-sm font-bold uppercase tracking-widest text-gold">Partenaire technique</p><p className="text-2xl font-extrabold">EMPIRE D’OR</p></div>
          </div>
          <div className="glass space-y-1 rounded-3xl p-5">
            <p className="text-sm font-bold uppercase tracking-widest text-gold">Contact</p>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="block text-xl font-extrabold">{phone}</a>
            <p>Facebook : PABO AWARDS</p>
            <p className="text-white/70">Bounkani, Côte d’Ivoire</p>
          </div>
        </aside>
      </div>
    </>
  );
}
