import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/admin";
import { COUNTRIES, DEFAULT_UNIT_PRICE, MAX_VOTES_HARD_LIMIT, METHODS, siteUrl } from "@/lib/config";
import { voteGate } from "@/lib/status";
import { cinetpayConfigured, initPayment } from "@/lib/cinetpay";
import { hashValue, newRef } from "@/lib/payments";
import type { Settings } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const fail = (code: string, status = 400) => NextResponse.json({ ok: false, code }, { status });

export async function POST(req: Request) {
  // Contrôle d'origine léger (bloque les appels venant d'autres sites, ne gêne aucune API externe)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return fail("forbidden", 403);
    } catch {
      return fail("forbidden", 403);
    }
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail("invalid");
  }
  if (body?.hp) return fail("invalid"); // pot de miel anti-robots

  const db = serviceClient();
  if (!db) return fail("service", 503);

  // ---- Validation stricte côté serveur (rien n'est cru venant du navigateur)
  const candidateId = String(body?.candidateId || "");
  const votes = Number(body?.votes);
  const method = String(body?.method || "");
  const countryCode = String(body?.country || "CI");
  const digits = String(body?.phone || "").replace(/\D/g, "");
  const country = COUNTRIES.find((c) => c.code === countryCode);
  if (!/^[0-9a-f-]{36}$/i.test(candidateId)) return fail("invalid");
  if (!Number.isInteger(votes) || votes < 1 || votes > MAX_VOTES_HARD_LIMIT) return fail("invalid");
  if (!METHODS.some((m) => m.id === method)) return fail("invalid");
  if (!country || !country.lengths.includes(digits.length)) return fail("phone");

  if (!cinetpayConfigured(country.code)) return fail("service", 503);

  const { data: settings } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
  const s = settings as Settings | null;
  if (!s) return fail("service", 503);
  if (s.max_votes_per_payment && votes > s.max_votes_per_payment) return fail("max");

  const { data: cand } = await db.from("candidates").select("id,name,status,category_id").eq("id", candidateId).maybeSingle();
  if (!cand || cand.status !== "active") return fail("candidate", 404);
  const { data: cat } = await db.from("categories").select("status,extended_until").eq("id", cand.category_id).maybeSingle();
  const gate = voteGate(cat as any, s);
  if (!gate.ok) return fail(gate.reason === "soon" ? "soon" : "closed", 403);

  // ---- Anti-abus : limites SUR L'INITIATION DE PAIEMENT uniquement (jamais sur les pages, ni sur l'admin, ni sur les notifications)
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const ipHash = hashValue(`ip:${ip}`);
  const phoneFull = `${country.dial}${digits}`;
  const phoneHash = hashValue(`ph:${phoneFull}`);
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const [{ count: byIp }, { count: byPhone }] = await Promise.all([
    db.from("transactions").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since),
    db.from("transactions").select("id", { count: "exact", head: true }).eq("phone_hash", phoneHash).gte("created_at", since),
  ]);
  if ((byIp || 0) >= 12 || (byPhone || 0) >= 8) return fail("rate", 429);

  // ---- Montant recalculé par le serveur
  const unit = s.vote_unit_price || DEFAULT_UNIT_PRICE;
  const amount = votes * unit;
  const ref = newRef();

  const { error: insErr } = await db.from("transactions").insert({
    ref, candidate_id: cand.id, votes, amount, currency: "XOF", method, country: country.code,
    phone: phoneFull, phone_hash: phoneHash, ip_hash: ipHash, status: "pending",
  });
  if (insErr) return fail("service", 500);

  const base = siteUrl();
  let res;
  try {
    res = await initPayment({
      ref, amount, method, country: country.code, phoneFull: `+${phoneFull}`,
      description: `PABO AWARDS - ${votes} vote(s) pour ${cand.name}`,
      notifyUrl: `${base}/api/cinetpay/notify`,
      returnUrl: `${base}/carte/${ref}`,
    });
  } catch {
    res = { ok: false as const, raw: { error: "network" } };
  }
  if (!res.ok || !res.paymentUrl) {
    await db.from("transactions").update({ status: "failed", provider_payload: (res.raw || null) as any }).eq("ref", ref);
    return fail("provider", 502);
  }
  await db.from("transactions").update({ payment_url: res.paymentUrl, notify_token: res.notifyToken || null, provider_ref: res.providerId || null }).eq("ref", ref);
  return NextResponse.json({ ok: true, ref, paymentUrl: res.paymentUrl });
}
