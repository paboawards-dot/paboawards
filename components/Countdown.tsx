"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { contestInfo } from "@/lib/status";
import type { Settings } from "@/lib/types";
import { IconVote } from "./Icons";

type Props = Pick<Settings, "votes_enabled" | "votes_open_at" | "votes_close_at" | "ceremony_at"> & { cta?: boolean };

function Unit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="glass flex min-w-[70px] flex-1 flex-col items-center rounded-2xl py-3 sm:min-w-[96px]">
      <span key={v} className="font-title animate-flipIn text-5xl leading-none text-gold-grad sm:text-7xl">{v}</span>
      <span className="mt-1 text-[11px] font-bold tracking-widest text-white/70 sm:text-xs">{label}</span>
    </div>
  );
}

export function Countdown({ cta = true, ...s }: Props) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <div className="skeleton mx-auto h-44 max-w-3xl rounded-3xl" aria-hidden />;

  const info = contestInfo({ ...(s as Settings) }, now);
  const pill = {
    open: "bg-emerald-500/20 text-emerald-300 border-emerald-400/50",
    soon: "bg-sun/20 text-gold border-gold/50",
    closed: "bg-coral/20 text-red-300 border-coral/60",
    ended: "bg-white/10 text-white/80 border-white/30",
  }[info.state];
  const dot = { open: "bg-emerald-400", soon: "bg-gold", closed: "bg-coral", ended: "bg-white/60" }[info.state];

  let d = 0, h = 0, m = 0, sec = 0;
  if (info.target) {
    const diff = Math.max(0, Date.parse(info.target) - now);
    d = Math.floor(diff / 86400000);
    h = Math.floor((diff % 86400000) / 3600000);
    m = Math.floor((diff % 3600000) / 60000);
    sec = Math.floor((diff % 60000) / 1000);
  }

  return (
    <div className="mx-auto max-w-3xl text-center" role="timer" aria-live="off">
      <span className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 font-title text-2xl tracking-wider ${pill}`}>
        <span className={`h-3 w-3 rounded-full ${dot} ${info.state === "open" ? "animate-pulse" : ""}`} />
        {info.label}
      </span>
      <p className="mt-3 text-lg font-semibold text-white/80">{info.hint}</p>
      {info.target && (
        <div className="mt-4 flex items-stretch justify-center gap-2 sm:gap-4">
          <Unit value={d} label="JOURS" />
          <Unit value={h} label="HEURES" />
          <Unit value={m} label="MIN" />
          <Unit value={sec} label="SEC" />
        </div>
      )}
      {cta && info.state === "open" && (
        <Link href="/voter" className="btn-vote mt-6 w-full max-w-sm">
          <IconVote size={26} /> Voter maintenant
        </Link>
      )}
    </div>
  );
}
