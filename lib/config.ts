import type { PayMethod } from "./types";

export const SITE_NAME = "PABO AWARDS";
export const SITE_TAGLINE = "La voix du public. Le talent du Bounkani.";
export const DEFAULT_UNIT_PRICE = 100;

/** Packs proposés (nombre de votes). Le montant = votes × prix unitaire. */
export const PACKS = [1, 5, 10, 20, 50, 100];

export const METHODS: { id: PayMethod; name: string; short: string; color: string; text: string; channels: "MOBILE_MONEY" | "ALL" }[] = [
  { id: "orange", name: "Orange Money", short: "Orange", color: "#ff7900", text: "#000000", channels: "MOBILE_MONEY" },
  { id: "mtn", name: "MTN Money", short: "MTN", color: "#ffcc00", text: "#000000", channels: "MOBILE_MONEY" },
  { id: "moov", name: "Moov Money", short: "Moov", color: "#0a6fd6", text: "#ffffff", channels: "MOBILE_MONEY" },
  { id: "wave", name: "Wave", short: "Wave", color: "#1dc8ff", text: "#06222e", channels: "ALL" },
];

/** Pays de la zone FCFA (XOF) — l'activation par pays dépend de votre compte CinetPay. */
const ALL_COUNTRIES: { code: string; name: string; flag: string; dial: string; lengths: number[]; example: string }[] = [
  { code: "CI", name: "Côte d’Ivoire", flag: "🇨🇮", dial: "225", lengths: [10], example: "07 00 00 00 00" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", dial: "226", lengths: [8], example: "70 00 00 00" },
  { code: "ML", name: "Mali", flag: "🇲🇱", dial: "223", lengths: [8], example: "70 00 00 00" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", dial: "221", lengths: [9], example: "77 000 00 00" },
  { code: "TG", name: "Togo", flag: "🇹🇬", dial: "228", lengths: [8], example: "90 00 00 00" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", dial: "229", lengths: [8, 10], example: "01 00 00 00 00" },
  { code: "NE", name: "Niger", flag: "🇳🇪", dial: "227", lengths: [8], example: "90 00 00 00" },
];

/** Pays réellement activés (un compte CinetPay = un pays). Par défaut : Côte d'Ivoire seulement. */
const ENABLED = (process.env.NEXT_PUBLIC_ENABLED_COUNTRIES || "CI").split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
export const COUNTRIES = ALL_COUNTRIES.filter((c) => ENABLED.includes(c.code));

/** CinetPay accepte au maximum 2 500 000 FCFA par paiement → 25 000 votes. */
export const MAX_VOTES_HARD_LIMIT = 25_000;

export function siteUrl(): string {
  const u = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") || "http://localhost:3000";
  return u.replace(/\/+$/, "");
}
