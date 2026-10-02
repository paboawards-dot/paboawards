"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { COUNTRIES, MAX_VOTES_HARD_LIMIT, METHODS, PACKS } from "@/lib/config";
import { fcfa, num } from "@/lib/format";
import type { PayMethod } from "@/lib/types";
import { PayLogo } from "./PayLogo";
import { Photo } from "./Photo";
import { IconBack, IconCheck, IconLock, IconMinus, IconPhone, IconPlus } from "./Icons";

type Props = {
  candidate: { id: string; slug: string; name: string; photo_url: string | null };
  category: { name: string; color: string; emoji: string };
  unitPrice: number;
  maxVotes: number | null;
};

const STEPS = [
  { icon: "🗳️", label: "Votes" },
  { icon: "💳", label: "Paiement" },
  { icon: "📱", label: "Numéro" },
  { icon: "✅", label: "Payer" },
];

const ERRORS: Record<string, string> = {
  closed: "Les votes sont fermés pour cette catégorie.",
  soon: "Les votes ne sont pas encore ouverts.",
  rate: "Trop d’essais en peu de temps. Attends quelques minutes puis réessaie.",
  phone: "Le numéro ne semble pas correct. Vérifie-le.",
  invalid: "Une information est incorrecte. Recommence le vote.",
  max: "Ce nombre de votes est trop élevé pour un seul paiement.",
  candidate: "Cet artiste n’est plus disponible.",
  provider: "Le service de paiement ne répond pas. Réessaie dans un instant.",
  service: "Le paiement est momentanément indisponible. Réessaie un peu plus tard.",
  network: "Pas de connexion internet. Vérifie ton réseau puis réessaie.",
  forbidden: "Opération refusée. Recharge la page puis réessaie.",
};

function group(d: string) {
  return d.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export function VoteWizard({ candidate, category, unitPrice, maxVotes }: Props) {
  const [step, setStep] = useState(0);
  const [votes, setVotes] = useState(10);
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [countryCode, setCountryCode] = useState("CI");
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  const m = METHODS.find((x) => x.id === method) || null;
  const amount = votes * unitPrice;
  const limit = Math.min(maxVotes || MAX_VOTES_HARD_LIMIT, MAX_VOTES_HARD_LIMIT);
  const votesOk = Number.isInteger(votes) && votes >= 1 && votes <= limit;
  const phoneOk = country.lengths.includes(phone.length);
  const packs = useMemo(() => PACKS.filter((p) => p <= limit), [limit]);
  const wanted = Math.max(...country.lengths);

  const setVotesSafe = (n: number) => {
    if (!Number.isFinite(n)) return;
    setVotes(Math.max(0, Math.min(limit, Math.floor(n))));
  };

  async function pay() {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/votes/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id, votes, method, country: countryCode, phone, hp }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok && j.paymentUrl) {
        try { sessionStorage.setItem("pabo_last_ref", j.ref); } catch {}
        window.location.href = j.paymentUrl;
        return; // on garde l'écran "paiement en cours"
      }
      setError(ERRORS[j.code] || ERRORS.service);
    } catch {
      setError(ERRORS.network);
    }
    setBusy(false);
  }

  if (busy) {
    return (
      <div className="glass mx-auto my-10 max-w-md animate-popIn rounded-3xl p-10 text-center" role="status" aria-live="polite">
        <div className="mx-auto h-20 w-20 animate-spin rounded-full border-8 border-white/15 border-t-gold" />
        <p className="font-title mt-6 text-4xl uppercase">Paiement en cours…</p>
        <p className="mt-2 text-lg text-white/75">Ne ferme pas cette page. Tu vas être redirigé pour confirmer.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Récapitulatif permanent : l'utilisateur voit toujours ce qu'il va payer */}
      <div className="glass sticky top-14 z-20 -mx-4 flex items-center gap-3 border-b border-white/10 px-4 py-2.5 sm:top-16 sm:mx-0 sm:rounded-2xl sm:border">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-gold">
          <Photo src={candidate.photo_url} name={candidate.name} color={category.color} sizes="56px" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold leading-tight">{candidate.name}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-gold">
            <span>{votesOk ? `${num(votes)} vote${votes > 1 ? "s" : ""}` : "— votes"}</span>
            <span aria-hidden>·</span>
            <span>{votesOk ? fcfa(amount) : "— FCFA"}</span>
          </p>
        </div>
        {m && <PayLogo id={m.id} size={40} />}
        {phoneOk && step >= 3 && <span className="hidden text-sm font-bold sm:block">+{country.dial} {group(phone)}</span>}
      </div>

      {/* Progression */}
      <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Étapes du vote">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex flex-col items-center gap-1">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-gold text-black ring-4 ring-gold/30" : "bg-white/10"}`}>
              {i < step ? <IconCheck size={24} /> : s.icon}
            </span>
            <span className={`text-xs font-bold ${i === step ? "text-gold" : "text-white/60"}`}>{s.label}</span>
          </li>
        ))}
      </ol>

      <div key={step} className="mt-6 animate-popIn">
        {/* ÉTAPE 1 : nombre de votes */}
        {step === 0 && (
          <section aria-labelledby="t0">
            <h2 id="t0" className="font-title text-4xl uppercase">Combien de votes ?</h2>
            <p className="text-white/70">100 FCFA = 1 vote</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {packs.map((p) => (
                <button key={p} type="button" onClick={() => setVotes(p)} aria-pressed={votes === p}
                  className={`flex min-h-[92px] flex-col items-center justify-center rounded-2xl border-2 p-3 transition active:scale-95 ${votes === p ? "border-gold bg-gold/20" : "border-white/15 bg-white/5 hover:bg-white/10"}`}>
                  <span className="font-title text-4xl leading-none">{num(p)}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">vote{p > 1 ? "s" : ""}</span>
                  <span className="mt-1 text-sm font-extrabold text-gold">{fcfa(p * unitPrice)}</span>
                </button>
              ))}
            </div>
            <div className="glass mt-4 rounded-2xl p-4">
              <label htmlFor="qty" className="text-sm font-bold uppercase tracking-wider text-white/70">Autre quantité</label>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" className="btn-ghost !h-14 !w-14 !px-0" aria-label="Moins de votes" onClick={() => setVotesSafe(votes - 1)}><IconMinus /></button>
                <input id="qty" inputMode="numeric" pattern="[0-9]*" value={votes === 0 ? "" : String(votes)} onChange={(e) => setVotesSafe(Number(e.target.value.replace(/\D/g, "")))}
                  className="font-title h-14 min-w-0 flex-1 rounded-2xl border border-white/20 bg-white/10 text-center text-4xl focus:border-gold focus:outline-none" />
                <button type="button" className="btn-ghost !h-14 !w-14 !px-0" aria-label="Plus de votes" onClick={() => setVotesSafe(votes + 1)}><IconPlus /></button>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-gradient-to-r from-violet/40 to-electric/40 p-4 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-white/80">Tu paies</p>
              <p className="font-title text-6xl text-gold-grad">{votesOk ? fcfa(amount) : "—"}</p>
              {votes >= limit && <p className="text-xs text-white/60">Maximum {num(limit)} votes par paiement</p>}
            </div>
            <button type="button" className="btn-vote mt-5 w-full" disabled={!votesOk} onClick={() => setStep(1)}>Suivant →</button>
          </section>
        )}

        {/* ÉTAPE 2 : moyen de paiement */}
        {step === 1 && (
          <section aria-labelledby="t1">
            <h2 id="t1" className="font-title text-4xl uppercase">Comment tu paies ?</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {METHODS.map((x) => (
                <button key={x.id} type="button" aria-pressed={method === x.id} onClick={() => { setMethod(x.id); setStep(2); }}
                  className={`flex min-h-[170px] flex-col items-center justify-center gap-3 rounded-3xl border-2 p-4 transition active:scale-95 ${method === x.id ? "border-gold bg-gold/15" : "border-white/15 bg-white/5 hover:bg-white/10"}`}>
                  <PayLogo id={x.id} size={84} />
                  <span className="text-lg font-extrabold">{x.name}</span>
                </button>
              ))}
            </div>
            <BackBtn onClick={() => setStep(0)} />
          </section>
        )}

        {/* ÉTAPE 3 : numéro */}
        {step === 2 && m && (
          <section aria-labelledby="t2">
            <h2 id="t2" className="font-title text-4xl uppercase">Ton numéro {m.short}</h2>
            <div className="glass mt-4 rounded-3xl p-5">
              <div className="flex items-center justify-center gap-4">
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-gold"><IconPhone size={44} /></span>
                <span aria-hidden className="text-3xl">→</span>
                <PayLogo id={m.id} size={80} />
              </div>
              <label htmlFor="country" className="mt-5 block text-sm font-bold uppercase tracking-wider text-white/70">Pays</label>
              <select id="country" value={countryCode} onChange={(e) => { setCountryCode(e.target.value); setPhone(""); }}
                className="mt-1 h-14 w-full rounded-2xl border border-white/20 bg-night px-4 text-lg font-semibold focus:border-gold focus:outline-none">
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name} (+{c.dial})</option>)}
              </select>
              <label htmlFor="phone" className="mt-4 block text-sm font-bold uppercase tracking-wider text-white/70">Numéro de téléphone</label>
              <div className="mt-1 flex items-stretch overflow-hidden rounded-2xl border border-white/20 bg-white/10 focus-within:border-gold">
                <span className="flex items-center bg-black/30 px-4 text-xl font-extrabold">+{country.dial}</span>
                <input id="phone" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]*" autoFocus maxLength={wanted}
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, wanted))} placeholder={country.example}
                  className="font-title h-16 min-w-0 flex-1 bg-transparent px-3 text-4xl tracking-wider placeholder:text-white/25 focus:outline-none" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2" aria-live="polite">
                <div className="flex gap-1" aria-hidden>
                  {Array.from({ length: wanted }).map((_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i < phone.length ? "bg-gold" : "bg-white/20"}`} />)}
                </div>
                <span className={`text-sm font-bold ${phoneOk ? "text-emerald-300" : "text-white/70"}`}>{phoneOk ? "Numéro complet ✓" : `${country.lengths.join(" ou ")} chiffres`}</span>
              </div>
            </div>
            <button type="button" className="btn-vote mt-5 w-full" disabled={!phoneOk} onClick={() => setStep(3)}>Suivant →</button>
            <BackBtn onClick={() => setStep(1)} />
          </section>
        )}

        {/* ÉTAPE 4 : récapitulatif */}
        {step === 3 && m && (
          <section aria-labelledby="t3">
            <h2 id="t3" className="font-title text-4xl uppercase">Vérifie avant de payer</h2>
            <dl className="glass mt-4 divide-y divide-white/10 overflow-hidden rounded-3xl">
              <Row label="ARTISTE" onEdit={() => (window.location.href = "/voter")}>
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full"><Photo src={candidate.photo_url} name={candidate.name} color={category.color} sizes="56px" /></span>
                <span className="text-xl font-extrabold leading-tight">{candidate.name}</span>
              </Row>
              <Row label="VOTES" onEdit={() => setStep(0)}><span className="font-title text-5xl text-gold-grad">{num(votes)}</span></Row>
              <Row label="MONTANT" onEdit={() => setStep(0)}><span className="font-title text-5xl">{fcfa(amount)}</span></Row>
              <Row label="PAIEMENT" onEdit={() => setStep(1)}><PayLogo id={m.id} size={52} /><span className="text-xl font-extrabold">{m.name}</span></Row>
              <Row label="NUMÉRO" onEdit={() => setStep(2)}><span className="font-title text-3xl tracking-wider">+{country.dial} {group(phone)}</span></Row>
            </dl>
            <input type="text" name="website" value={hp} onChange={(e) => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            {error && <p role="alert" className="mt-4 rounded-2xl border border-coral/60 bg-coral/15 p-4 text-lg font-semibold">⚠️ {error}</p>}
            <button type="button" className="btn-vote mt-5 w-full !min-h-[68px] !text-3xl animate-pulseGlow" onClick={pay}>
              <IconLock size={26} /> Payer {fcfa(amount)}
            </button>
            <p className="mt-3 text-center text-sm text-white/65">Ton vote est compté uniquement après la confirmation du paiement.</p>
            <BackBtn onClick={() => setStep(2)} />
          </section>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-white/50">
        <Link href={`/artistes/${candidate.slug}`} className="underline">Voir la fiche de {candidate.name}</Link>
      </p>
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="btn-ghost mt-3 w-full">
      <IconBack size={20} /> Retour
    </button>
  );
}

function Row({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <dt className="w-24 shrink-0 text-xs font-extrabold tracking-widest text-white/60">{label}</dt>
      <dd className="flex min-w-0 flex-1 items-center gap-3">{children}</dd>
      <button type="button" onClick={onEdit} className="shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-gold underline">Changer</button>
    </div>
  );
}
