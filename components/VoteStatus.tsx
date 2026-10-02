"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fireConfetti } from "./Confetti";
import { CopyLinkButton } from "./CopyLinkButton";
import { IconAlert, IconArrow, IconCheck, IconClock, IconDownload, IconShare, IconTrophy, IconVote } from "./Icons";
import { fcfa, num } from "@/lib/format";

type Props = {
  tx: string;
  initialStatus: string;
  candidate: { name: string; slug: string };
  votes: number;
  amount: number;
};

export function VoteStatus({ tx, initialStatus, candidate, votes, amount }: Props) {
  const [status, setStatus] = useState(initialStatus === "already" ? "confirmed" : initialStatus);
  const [checking, setChecking] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const celebrated = useRef(false);
  const started = useRef(Date.now());

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const r = await fetch(`/api/payment/status?ref=${tx}`, { cache: "no-store" });
      const j = await r.json();
      if (j?.status) setStatus(j.status === "already" ? "confirmed" : j.status);
    } catch {
      /* réseau : on réessaie au prochain tour */
    }
    setChecking(false);
  }, [tx]);

  // Vérification automatique tant que le paiement est en attente
  useEffect(() => {
    if (status !== "pending") return;
    check();
    const id = setInterval(() => {
      if (Date.now() - started.current < 15 * 60 * 1000) check();
    }, 4000);
    return () => clearInterval(id);
  }, [status, check]);

  useEffect(() => {
    if (status === "confirmed" && !celebrated.current) {
      celebrated.current = true;
      fireConfetti();
    }
  }, [status]);

  const artistPath = `/artistes/${candidate.slug}`;
  const cardUrl = `/api/vote-card/${tx}`;
  const shareText = `J’ai voté pour ${candidate.name} aux PABO AWARDS ! Vote toi aussi 👇`;

  async function share() {
    const url = `${window.location.origin}${artistPath}`;
    try {
      const r = await fetch(cardUrl);
      const blob = await r.blob();
      const file = new File([blob], `pabo-awards-vote.png`, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: "PABO AWARDS", text: `${shareText} ${url}` });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "PABO AWARDS", text: shareText, url });
        return;
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
    }
    setFallback(true);
  }

  if (status === "confirmed") {
    const url = typeof window !== "undefined" ? `${window.location.origin}${artistPath}` : artistPath;
    const enc = encodeURIComponent;
    return (
      <div className="container-x py-8">
        <div className="mx-auto max-w-md text-center">
          <div className="pop-bounce mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_60px_rgba(16,185,129,.7)]"><IconCheck size={56} /></div>
          <h1 className="font-title mt-4 text-6xl uppercase leading-none text-gold-grad">Vote confirmé !</h1>
          <p className="mt-2 text-lg text-white/80">Merci ! <strong>{num(votes)} vote{votes > 1 ? "s" : ""}</strong> pour <strong>{candidate.name}</strong> ({fcfa(amount)}).</p>

          <div className="relative mx-auto mt-6 aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/20 bg-night shadow-[0_30px_80px_-30px_rgba(139,92,246,.9)]">
            {imgOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cardUrl} alt={`Carte de vote pour ${candidate.name}`} className="h-full w-full object-cover" onError={() => setImgOk(false)} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
                <IconAlert size={40} />
                <p>La carte s’affichera dans un instant. Réessaie en rechargeant la page.</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3">
            <button type="button" className="btn-vote w-full" onClick={share}><IconShare size={24} /> Partager mon vote</button>
            <a className="btn-ghost w-full" href={`${cardUrl}?download=1`} download><IconDownload size={20} /> Télécharger ma carte</a>
            <CopyLinkButton path={artistPath} className="btn-ghost w-full" />
          </div>

          {fallback && (
            <div className="glass mt-4 animate-popIn rounded-2xl p-4">
              <p className="mb-3 text-sm font-bold">Partager avec :</p>
              <div className="grid grid-cols-2 gap-2">
                <a className="btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${enc(`${shareText} ${url}`)}`}>WhatsApp</a>
                <a className="btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}>Facebook</a>
                <a className="btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://t.me/share/url?url=${enc(url)}&text=${enc(shareText)}`}>Telegram</a>
                <a className="btn-ghost" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`}>X</a>
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-3">
            <Link href={`/voter/${candidate.slug}`} className="btn-vote w-full"><IconVote size={24} /> Voter à nouveau</Link>
            <Link href={artistPath} className="btn-ghost w-full"><IconArrow size={20} /> Revenir vers {candidate.name}</Link>
            <Link href="/classement" className="btn-ghost w-full"><IconTrophy size={20} /> Voir le classement</Link>
          </div>
          <p className="mt-6 text-xs text-white/50">N° de transaction : {tx}</p>
        </div>
      </div>
    );
  }

  const box = (icon: React.ReactNode, title: string, text: string, ring: string, extra?: React.ReactNode) => (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-12">
      <div className="glass w-full max-w-md animate-popIn rounded-3xl p-8 text-center" role="status" aria-live="polite">
        <div className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full ${ring}`}>{icon}</div>
        <h1 className="font-title text-4xl uppercase leading-none">{title}</h1>
        <p className="mt-3 text-lg text-white/75">{text}</p>
        <div className="mt-6 grid gap-3">{extra}</div>
        <p className="mt-6 text-xs text-white/45">N° de transaction : {tx}</p>
      </div>
    </div>
  );

  if (status === "failed" || status === "expired") {
    return box(<IconAlert size={48} />, "Paiement non abouti", "Aucun vote n’a été ajouté et rien n’a été débité par PABO AWARDS. Tu peux réessayer.", "bg-coral/80",
      <>
        <Link href={`/voter/${candidate.slug}`} className="btn-vote w-full">Réessayer</Link>
        <Link href="/contact" className="btn-ghost w-full">J’ai été débité : contacter</Link>
      </>);
  }
  if (status === "flagged") {
    return box(<IconAlert size={48} />, "Vérification en cours", "Ton paiement doit être vérifié par l’équipe. Garde ton numéro de transaction et contacte-nous.", "bg-sun/80",
      <Link href="/contact" className="btn-vote w-full">Contacter l’équipe</Link>);
  }
  return box(<div className="h-12 w-12 animate-spin rounded-full border-4 border-black/20 border-t-black" />, "Paiement en attente", "Confirme le paiement sur ton téléphone si une demande apparaît. Cette page se met à jour toute seule.", "bg-gold",
    <>
      <button type="button" className="btn-vote w-full" onClick={check} disabled={checking}><IconClock size={22} /> {checking ? "Vérification…" : "Vérifier maintenant"}</button>
      <Link href="/" className="btn-ghost w-full">Retour à l’accueil</Link>
    </>);
}
