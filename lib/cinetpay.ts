/**
 * Intégration CinetPay — NOUVELLE API (v1) : clé API + mot de passe API (plus d'identifiant de site).
 *  - Connexion : POST /v1/oauth/login  → jeton (valable 24 h, gardé en mémoire et renouvelé tout seul)
 *  - Paiement  : POST /v1/payment
 *  - Statut    : GET  /v1/payment/{merchant_transaction_id}
 *  Sandbox (clé sk_test_…) : https://api.cinetpay.net  ·  Réel (clé sk_live_…) : https://api.cinetpay.co
 */
import { COUNTRIES } from "./config";

type Creds = { key: string; password: string };

/** Identifiants par pays. Le compte actuel est rattaché à la Côte d'Ivoire : CINETPAY_API_KEY / CINETPAY_API_PASSWORD. */
export function credsFor(country: string): Creds | null {
  const cc = country.toUpperCase();
  const key = process.env[`CINETPAY_API_KEY_${cc}`] || (cc === "CI" ? process.env.CINETPAY_API_KEY : undefined);
  const password = process.env[`CINETPAY_API_PASSWORD_${cc}`] || (cc === "CI" ? process.env.CINETPAY_API_PASSWORD : undefined);
  return key && password ? { key: key.trim(), password: password.trim() } : null;
}

export function cinetpayConfigured(country = "CI"): boolean {
  return credsFor(country) !== null;
}

function baseUrl(key: string): string {
  const o = process.env.CINETPAY_BASE_URL;
  if (o) return o.replace(/\/+$/, "");
  return key.startsWith("sk_live_") ? "https://api.cinetpay.co" : "https://api.cinetpay.net";
}

type HttpResult = { http: number; json: any };

async function http(method: "GET" | "POST", url: string, body?: unknown, token?: string): Promise<HttpResult> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: ctl.signal,
    });
    const json = await r.json().catch(() => ({}));
    return { http: r.status, json };
  } finally {
    clearTimeout(t);
  }
}

const tokens = new Map<string, { token: string; exp: number }>();

async function getToken(country: string, force = false): Promise<string> {
  const c = credsFor(country);
  if (!c) throw new Error("no_credentials");
  const cached = tokens.get(country);
  if (!force && cached && cached.exp > Date.now() + 60_000) return cached.token;
  const r = await http("POST", `${baseUrl(c.key)}/v1/oauth/login`, { api_key: c.key, api_password: c.password });
  const token = r.json?.access_token;
  if (!token) throw new Error(`auth_failed http=${r.http} ${JSON.stringify(r.json).slice(0, 300)}`);
  tokens.set(country, { token, exp: Date.now() + (Number(r.json?.expires_in) || 3600) * 1000 });
  return token;
}

/** Appel authentifié ; si le jeton est expiré, on en redemande un et on réessaie une fois. */
async function call(country: string, method: "GET" | "POST", path: string, body?: unknown): Promise<HttpResult> {
  const c = credsFor(country);
  if (!c) throw new Error("no_credentials");
  let last: HttpResult = { http: 0, json: {} };
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await getToken(country, attempt === 1);
    last = await http(method, `${baseUrl(c.key)}${path}`, body, token);
    const expired = last.http === 401 || String(last.json?.code) === "1003" || last.json?.status === "EXPIRED_TOKEN";
    if (!expired) return last;
  }
  return last;
}

export type InitArgs = {
  ref: string; amount: number; description: string; notifyUrl: string; returnUrl: string;
  method: string; country: string; phoneFull: string;
};

export type InitResult = { ok: boolean; paymentUrl?: string; notifyToken?: string; providerId?: string; raw?: unknown };

// Codes des moyens de paiement CinetPay (connus pour la Côte d'Ivoire)
const CI_METHODS: Record<string, string> = { orange: "OM_CI", mtn: "MTN_CI", moov: "MOOV_CI", wave: "WAVE_CI" };

export async function initPayment(a: InitArgs): Promise<InitResult> {
  const country = COUNTRIES.find((c) => c.code === a.country)?.code || "CI";
  const build = (withMethod: boolean) => ({
    currency: "XOF",
    merchant_transaction_id: a.ref,
    amount: a.amount,
    lang: "fr",
    designation: a.description.replace(/[^\w À-ÿ’'.,-]/g, "").slice(0, 100) || "PABO AWARDS",
    client_email: process.env.CINETPAY_CLIENT_EMAIL || "vote@pabo-awards.com",
    client_first_name: "Votant",
    client_last_name: "PABO",
    client_phone_number: a.phoneFull,
    success_url: a.returnUrl,
    failed_url: a.returnUrl,
    notify_url: a.notifyUrl,
    channel: "PUSH",
    ...(withMethod && country === "CI" && CI_METHODS[a.method] ? { payment_method: CI_METHODS[a.method] } : {}),
  });

  const parse = (j: any): InitResult => {
    const r = j?.data ?? j;
    const url = r?.payment_url;
    if (url) return { ok: true, paymentUrl: url, notifyToken: r?.notify_token, providerId: r?.transaction_id, raw: j };
    return { ok: false, raw: j };
  };

  // 1er essai avec l'opérateur choisi ; si CinetPay le refuse, 2e essai : l'utilisateur choisira sur la page CinetPay.
  const r1 = await call(country, "POST", "/v1/payment", build(true));
  let res = parse(r1.json);
  if (!res.ok) {
    const r2 = await call(country, "POST", "/v1/payment", build(false));
    res = parse(r2.json);
    if (!res.ok) res = { ok: false, raw: { essai1: { http: r1.http, reponse: r1.json }, essai2: { http: r2.http, reponse: r2.json } } };
  }
  return res;
}

export type CheckResult = { state: "accepted" | "refused" | "pending"; amount?: number; providerId?: string; raw: unknown };

export async function checkPayment(ref: string, country = "CI"): Promise<CheckResult> {
  const r = await call(country, "GET", `/v1/payment/${encodeURIComponent(ref)}`);
  const j = r.json;
  const d = j?.data ?? j;
  const status = String(d?.status || j?.status || "").toUpperCase();
  const merchantId = d?.merchant_transaction_id;
  if (merchantId && merchantId !== ref) return { state: "pending", raw: j };
  const amount = d?.amount != null && d.amount !== "" ? Number(d.amount) : undefined;
  if (status === "SUCCESS") return { state: "accepted", amount, providerId: d?.transaction_id, raw: j };
  if (status === "FAILED" || status === "INSUFFICIENT_BALANCE") return { state: "refused", raw: j };
  return { state: "pending", raw: j };
}
