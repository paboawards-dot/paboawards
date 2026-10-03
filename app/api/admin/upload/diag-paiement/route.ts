import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin-auth";
import { fetchViaProxy, proxyConfigured } from "@/lib/proxy-fetch";
import { testLogin } from "@/lib/cinetpay";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Outil de test réservé à l'admin : /api/admin/diag-paiement (aucun secret n'est affiché). */
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const out: Record<string, unknown> = {};
  const raw = process.env.CINETPAY_PROXY_URL || "";
  out["1_variable_proxy_presente"] = !!raw;
  if (raw) {
    try {
      const u = new URL(raw);
      out["1b_proxy_hote_port"] = `${u.hostname}:${u.port || "(défaut)"}`;
      out["1c_proxy_a_utilisateur_et_motdepasse"] = !!(u.username && u.password);
      out["1d_protocole"] = u.protocol;
    } catch {
      out["1b_proxy_format"] = "INVALIDE : la valeur doit ressembler à http://utilisateur:motdepasse@hote:port";
    }
  }
  out["1e_cle_api_presente"] = !!process.env.CINETPAY_API_KEY;
  out["1f_mot_de_passe_api_present"] = !!process.env.CINETPAY_API_PASSWORD;
  out["1g_type_de_cle"] = (process.env.CINETPAY_API_KEY || "").startsWith("sk_live_") ? "production (sk_live_)" : "sandbox (sk_test_ ou autre)";

  // Adresse vue depuis Vercel, sans proxy
  try {
    const r = await fetch("https://api.ipify.org?format=json", { cache: "no-store", signal: AbortSignal.timeout(8000) });
    out["2_ip_de_vercel_sans_proxy"] = (await r.json())?.ip;
  } catch (e: any) {
    out["2_ip_de_vercel_sans_proxy"] = "erreur : " + String(e?.message || e).slice(0, 100);
  }

  // Adresse vue via le proxy
  if (proxyConfigured()) {
    try {
      const r = await fetchViaProxy("GET", "https://api.ipify.org?format=json", { Accept: "application/json" }, undefined, 10000);
      let ip: unknown = r.text.slice(0, 80);
      try { ip = JSON.parse(r.text).ip; } catch { /* texte brut */ }
      out["3_ip_via_le_proxy"] = ip;
    } catch (e: any) {
      out["3_ip_via_le_proxy"] = "ÉCHEC : " + String(e?.message || e).slice(0, 150);
    }
  } else {
    out["3_ip_via_le_proxy"] = "proxy non configuré (le site appelle CinetPay en direct)";
  }

  // Connexion CinetPay (passe par le proxy s'il est configuré)
  out["4_connexion_cinetpay"] = await testLogin("CI");

  const login: any = out["4_connexion_cinetpay"];
  const ipProxy = out["3_ip_via_le_proxy"];
  let verdict = "";
  if (!raw) verdict = "Le proxy n'est PAS configuré dans Vercel (variable CINETPAY_PROXY_URL absente ou pas redéployée).";
  else if (typeof ipProxy === "string" && ipProxy.startsWith("ÉCHEC")) verdict = "Le proxy est configuré mais le site n'arrive pas à l'utiliser : vérifie l'adresse, le port, l'utilisateur et le mot de passe.";
  else if (login?.ok) verdict = "TOUT FONCTIONNE : le proxy est utilisé et CinetPay accepte la connexion.";
  else if (String(login?.status) === "NOT_ALLOWED") verdict = `Le proxy est utilisé (adresse vue : ${ipProxy}) mais CinetPay refuse : ajoute exactement cette adresse dans la liste blanche de CinetPay.`;
  else verdict = "Le proxy fonctionne mais CinetPay refuse la connexion pour une autre raison : voir 4_connexion_cinetpay.";
  out["VERDICT"] = verdict;

  return NextResponse.json(out, { status: 200, headers: { "Cache-Control": "no-store" } });
}
