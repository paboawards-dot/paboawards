import type { Category, Settings } from "./types";

export type ContestState = "soon" | "open" | "closed" | "ended";

export type ContestInfo = {
  state: ContestState;
  label: string;
  hint: string;
  /** date cible du compte à rebours (ISO) ou null */
  target: string | null;
};

export function contestInfo(s: Settings | null, nowMs: number = Date.now()): ContestInfo {
  if (!s) return { state: "soon", label: "BIENTÔT", hint: "Les votes ouvrent bientôt", target: null };
  const open = s.votes_open_at ? Date.parse(s.votes_open_at) : null;
  const close = s.votes_close_at ? Date.parse(s.votes_close_at) : null;
  const cer = s.ceremony_at ? Date.parse(s.ceremony_at) : null;

  if (cer && nowMs >= cer) return { state: "ended", label: "CONCOURS TERMINÉ", hint: "Merci à tous les votants !", target: null };
  if (!s.votes_enabled) return { state: "closed", label: "VOTES FERMÉS", hint: "Les votes sont fermés pour le moment", target: null };
  if (open && nowMs < open) return { state: "soon", label: "BIENTÔT OUVERT", hint: "Ouverture des votes dans", target: s.votes_open_at };
  if (close && nowMs >= close) return { state: "closed", label: "VOTES FERMÉS", hint: "Les votes sont terminés", target: s.ceremony_at && cer && nowMs < cer ? s.ceremony_at : null };
  return { state: "open", label: "VOTES OUVERTS", hint: close ? "Fin des votes dans" : "Vote maintenant !", target: close ? s.votes_close_at : null };
}

export type VoteGate = { ok: boolean; reason: "ok" | "soon" | "closed" | "ended" | "category_closed" };

/** Règle unique (utilisée côté serveur ET pour l'affichage) : peut-on voter dans cette catégorie ? */
export function voteGate(cat: Pick<Category, "status" | "extended_until"> | null, s: Settings | null, nowMs: number = Date.now()): VoteGate {
  if (!s) return { ok: false, reason: "closed" };
  const info = contestInfo(s, nowMs);
  if (info.state === "ended") return { ok: false, reason: "ended" };
  if (!s.votes_enabled) return { ok: false, reason: "closed" };
  if (info.state === "soon") return { ok: false, reason: "soon" };
  if (cat && cat.status === "closed") return { ok: false, reason: "category_closed" };
  if (info.state === "closed") {
    const ext = cat?.extended_until ? Date.parse(cat.extended_until) : 0;
    if (ext && nowMs < ext) return { ok: true, reason: "ok" };
    return { ok: false, reason: "closed" };
  }
  return { ok: true, reason: "ok" };
}
