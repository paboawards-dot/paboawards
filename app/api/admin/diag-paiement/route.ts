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

  // Variables d'environnement liées à un proxy (noms seulement, jamais les valeurs)
  out["1h_autres_variables_proxy_detectees"] = Object.keys(process.env).filter((k) => /proxy/i.test(k) && k !== "CINETPAY_PROXY_URL");
  out["1i_region_vercel"] = process.env.VERCEL_REGION || "inconnue";

  // Adresse vue depuis Vercel, sans proxy, avec 3 services différents
  const echo = [
    ["ipify", "https://api.ipify.org?format=json", true],
    ["icanhazip", "https://ipv4.icanhazip.com", false],
    ["ifconfig", "https://ifconfig.me/ip", false],
  ] as const;
  const direct: Record<string, string> = {};
  for (const [name, url, isJson] of echo) {
    try {
      const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000), headers: { Accept: "application/json, text/plain" } });
      const t = (await r.text()).trim();
      direct[name] = isJson ? (JSON.parse(t)?.ip ?? t.slice(0, 60)) : t.slice(0, 60);
    } catch (e: any) {
      direct[name] = "erreur : " + String(e?.message || e).slice(0, 80);
    }
  }
  out["2_ip_vue_sans_proxy"] = direct;

  // Adresse vue via le proxy, avec les mêmes 3 services
  const viaProxy: Record<string, string> = {};
  if (proxyConfigured()) {
    for (const [name, url, isJson] of echo) {
      try {
        const r = await fetchViaProxy("GET", url, { Accept: "application/json, text/plain" }, undefined, 10000);
        const t = r.text.trim();
        let ip = t.slice(0, 60);
        if (isJson) { try { ip = JSON.parse(t).ip; } catch { /* texte brut */ } }
        viaProxy[name] = `${ip} (http ${r.status})`;
      } catch (e: any) {
        viaProxy[name] = "ÉCHEC : " + String(e?.message || e).slice(0, 120);
      }
    }
  } else {
    viaProxy["info"] = "proxy non configuré";
  }
  out["3_ip_vue_via_le_proxy"] = viaProxy;

  // Connexion CinetPay (passe par le proxy s'il est configuré)
  out["4_connexion_cinetpay"] = await testLogin("CI");

  const login: any = out["4_connexion_cinetpay"];
  const directIps = Object.values(direct).filter((v) => /^\d+\.\d+\.\d+\.\d+$/.test(v));
  const proxyIps = Object.values(viaProxy).map((v) => v.split(" ")[0]).filter((v) => /^\d+\.\d+\.\d+\.\d+$/.test(v));
  const sameAsDirect = proxyIps.length > 0 && proxyIps.every((ip) => directIps.includes(ip));
  let verdict = "";
  if (!raw) verdict = "Le proxy n'est PAS configuré dans Vercel (variable CINETPAY_PROXY_URL absente ou pas redéployée).";
  else if (proxyIps.length === 0) verdict = "Le proxy est configuré mais le site n'arrive pas à l'utiliser : vérifie l'adresse, le port, l'utilisateur et le mot de passe (voir 3_ip_vue_via_le_proxy).";
  else if (sameAsDirect) verdict = "ATTENTION : l'adresse vue via le proxy est identique à celle de Vercel. Le proxy ne change PAS l'adresse de sortie : ne pas se fier à la liste blanche, contacter le support du proxy.";
  else if (login?.ok) verdict = "TOUT FONCTIONNE : le proxy change bien l'adresse et CinetPay accepte la connexion.";
  else if (String(login?.status) === "NOT_ALLOWED") verdict = `Le proxy change bien l'adresse (vue : ${proxyIps.join(", ")}) mais CinetPay la refuse : ajoute exactement cette adresse dans la liste blanche de CinetPay.`;
  else verdict = "Le proxy change l'adresse mais CinetPay refuse la connexion pour une autre raison : voir 4_connexion_cinetpay.";
  out["VERDICT"] = verdict;

  return NextResponse.json(out, { status: 200, headers: { "Cache-Control": "no-store" } });
}
