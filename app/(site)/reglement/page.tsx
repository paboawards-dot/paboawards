import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { getSettings } from "@/lib/data";
import { dateFr } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = { title: "Règlement", description: "Règlement du vote en ligne des PABO AWARDS." };

export default async function RulesPage() {
  const s = await getSettings();
  const open = s?.votes_open_at ? dateFr(s.votes_open_at) : "la date annoncée sur le site";
  const close = s?.votes_close_at ? dateFr(s.votes_close_at) : "la date annoncée sur le site";
  const phone = s?.contact_phone || "+225 07 18 27 57 97";
  const articles: { t: string; p: string[] }[] = [
    { t: "Organisation", p: ["Les PABO AWARDS — Prix de l’Art du Bounkani sont présentés par Esprit Guerrier. La gestion et la sécurisation du système de vote et de paiement sont assurées en partenariat technique avec EMPIRE D’OR."] },
    { t: "Catégories et candidats", p: ["Le concours comporte 15 catégories regroupées en trois univers : Musique & Danse, Digital & Médias, Culture & Événementiel.", "Seuls les candidats présentés sur le site officiel peuvent recevoir des votes. Chaque candidat concourt dans la catégorie indiquée sur sa fiche."] },
    { t: "Période de vote", p: [`Les votes ouvrent le ${open} et se terminent le ${close}, sauf modification ou prolongation annoncée sur le site.`, "Le statut du concours (bientôt ouvert, votes ouverts, votes fermés, concours terminé) est affiché sur le site. Les organisateurs peuvent ouvrir, fermer ou prolonger le vote d’une catégorie."] },
    { t: "Le vote", p: ["Le vote est public et se fait en ligne. 100 FCFA = 1 vote.", "Chacun peut voter plusieurs fois, pour le même candidat ou pour des candidats différents, en choisissant un pack de votes ou une quantité personnalisée."] },
    { t: "Paiement", p: ["Le paiement s’effectue par Mobile Money (Orange Money, MTN Money, Moov Money, Wave) via l’agrégateur de paiement CinetPay.", "Un vote n’est validé et comptabilisé qu’après la confirmation réelle du paiement par l’opérateur. Un simple clic sur « Payer » ne constitue pas un vote.", "Chaque transaction reçoit un numéro unique permettant de la retrouver. Un même paiement ne peut jamais générer plusieurs fois les mêmes votes."] },
    { t: "Carte de vote", p: ["Après un paiement confirmé, une carte de vote partageable est générée : elle indique le candidat, le nombre de votes, le montant, la date et le numéro de transaction."] },
    { t: "Classement et résultats", p: ["Le classement de chaque catégorie est établi à partir des votes confirmés et se met à jour en direct pendant la période de vote.", "Le vainqueur d’une catégorie est le candidat ayant reçu le plus grand nombre de votes confirmés à la clôture des votes. En cas d’égalité parfaite, est déclaré vainqueur le candidat qui a atteint ce total en premier.", "Le résultat officiel est celui du système de vote, après les vérifications d’usage."] },
    { t: "Récompense", p: ["Pour chaque catégorie, 50 % des recettes des votes reviennent au vainqueur et 50 % à l’organisation. La remise du gain au vainqueur a lieu lors de la cérémonie."] },
    { t: "Fraude et sécurité", p: ["Toute tentative de fraude, de manipulation du nombre de votes, de faux paiement, d’utilisation de moyens automatisés ou d’abus du système est interdite.", "Les organisateurs peuvent suspendre ou annuler les votes liés à une opération frauduleuse ou suspecte, et exclure un candidat bénéficiant de telles pratiques."] },
    { t: "Réclamations et remboursements", p: ["Les votes confirmés ne sont pas remboursables. En cas de paiement débité sans vote enregistré, contactez l’équipe en indiquant le numéro de transaction ; après vérification, les votes seront ajoutés ou le montant traité selon le cas.", `Contact : ${phone}.`] },
    { t: "Données personnelles", p: ["Le numéro de téléphone saisi sert uniquement au paiement et à la traçabilité des transactions. Il n’est jamais affiché publiquement. Le montant total généré par le concours n’est pas publié sur le site."] },
    { t: "Modification du règlement", p: ["Les organisateurs peuvent adapter le présent règlement pour garantir le bon déroulement du concours. La version en vigueur est celle publiée sur cette page."] },
  ];
  return (
    <>
      <PageHead kicker="Transparence" title="Règlement" text="Les règles du vote en ligne des PABO AWARDS." />
      <div className="container-x max-w-3xl space-y-4 py-6">
        {articles.map((a, i) => (
          <section key={a.t} className="glass rounded-3xl p-6">
            <h2 className="flex items-center gap-3 text-xl font-extrabold">
              <span className="font-title flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-2xl text-black">{i + 1}</span> {a.t}
            </h2>
            <div className="mt-3 space-y-2 text-white/85">{a.p.map((t, k) => <p key={k}>{t}</p>)}</div>
          </section>
        ))}
      </div>
    </>
  );
}
