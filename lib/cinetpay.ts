import { COUNTRIES, METHODS } from "./config";

const BASE = "https://api-checkout.cinetpay.com/v2";

export type InitArgs = {
  ref: string; amount: number; description: string; notifyUrl: string; returnUrl: string;
  method: string; country: string; phoneFull: string;
};

async function post(path: string, body: Record<string, unknown>) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: ctl.signal,
    });
    const json = await r.json().catch(() => ({}));
    return json as any;
  } finally {
    clearTimeout(t);
  }
}

export function cinetpayConfigured(): boolean {
  return Boolean(process.env.CINETPAY_API_KEY && process.env.CINETPAY_SITE_ID);
}

export async function initPayment(a: InitArgs): Promise<{ ok: boolean; paymentUrl?: string; token?: string; raw?: unknown }> {
  const m = METHODS.find((x) => x.id === a.method);
  const country = COUNTRIES.find((c) => c.code === a.country);
  const res = await post("/payment", {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: a.ref,
    amount: a.amount,
    currency: "XOF",
    description: a.description.slice(0, 120),
    notify_url: a.notifyUrl,
    return_url: a.returnUrl,
    channels: m?.channels || "ALL",
    lang: "fr",
    customer_id: a.ref,
    customer_name: "Votant",
    customer_surname: "PABO",
    customer_email: "vote@pabo-awards.com",
    customer_phone_number: a.phoneFull,
    customer_address: "Bounkani",
    customer_city: "Bouna",
    customer_country: country?.code || "CI",
    customer_state: country?.code || "CI",
    customer_zip_code: "00225",
    metadata: a.ref,
  });
  const url = res?.data?.payment_url;
  if (String(res?.code) === "201" && url) return { ok: true, paymentUrl: url, token: res?.data?.payment_token, raw: res };
  return { ok: false, raw: res };
}

export type CheckResult = { state: "accepted" | "refused" | "pending"; amount?: number; raw: unknown };

export async function checkPayment(ref: string): Promise<CheckResult> {
  const res = await post("/payment/check", {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: ref,
  });
  const status = String(res?.data?.status || "").toUpperCase();
  if (String(res?.code) === "00" && status === "ACCEPTED") {
    return { state: "accepted", amount: Number(res?.data?.amount), raw: res };
  }
  if (status === "REFUSED") return { state: "refused", raw: res };
  return { state: "pending", raw: res };
}
