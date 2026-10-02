import { randomBytes, createHash } from "crypto";
import { serviceClient } from "./supabase/admin";
import { checkPayment } from "./cinetpay";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newRef(): string {
  const bytes = randomBytes(12);
  let s = "PABO";
  for (let i = 0; i < 12; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

export function hashValue(v: string): string {
  const salt = process.env.IP_HASH_SALT || "pabo-awards";
  return createHash("sha256").update(`${salt}:${v}`).digest("hex");
}

export type ApplyResult = "confirmed" | "already" | "failed" | "pending" | "expired" | "flagged" | "not_found" | "error";

/**
 * Cœur de la sécurité du vote :
 * on ne croit JAMAIS le navigateur ni la notification brute — on interroge CinetPay côté serveur,
 * on vérifie le montant, puis la fonction SQL crédite les votes UNE seule fois (idempotente).
 */
export async function verifyAndApply(ref: string, opts: { throttleMs?: number } = {}): Promise<ApplyResult> {
  const db = serviceClient();
  if (!db) return "error";
  const { data: tx } = await db.from("transactions").select("*").eq("ref", ref).maybeSingle();
  if (!tx) return "not_found";
  if (tx.status === "confirmed") return "already";
  if (tx.status === "flagged") return "flagged";

  if (opts.throttleMs && tx.last_check_at && Date.now() - Date.parse(tx.last_check_at) < opts.throttleMs) {
    return tx.status === "pending" ? "pending" : (tx.status as ApplyResult);
  }
  await db.from("transactions").update({ last_check_at: new Date().toISOString() }).eq("id", tx.id);

  let check;
  try {
    check = await checkPayment(ref, tx.country || "CI");
  } catch {
    return tx.status === "pending" ? "pending" : (tx.status as ApplyResult);
  }

  if (check.state === "accepted") {
    const { data } = await db.rpc("confirm_transaction", { p_ref: ref, p_amount: check.amount ?? tx.amount, p_payload: check.raw as object });
    if (data === "confirmed") return "confirmed";
    if (data === "already") return "already";
    if (data === "amount_mismatch") return "flagged";
    return "error";
  }
  if (check.state === "refused") {
    await db.rpc("fail_transaction", { p_ref: ref, p_payload: check.raw as object });
    return "failed";
  }
  if (tx.status === "pending" && Date.now() - Date.parse(tx.created_at) > 30 * 60 * 1000) {
    await db.rpc("expire_pending");
    return "expired";
  }
  return tx.status === "pending" ? "pending" : (tx.status as ApplyResult);
}
