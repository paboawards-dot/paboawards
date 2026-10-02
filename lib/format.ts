export function num(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
export function fcfa(n: number): string {
  return `${num(n)} FCFA`;
}
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export function dateFr(iso: string | null | undefined, withTime = false): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const base = `${d.getUTCDate() === 1 ? "1er" : d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  if (!withTime) return base;
  return `${base} à ${String(d.getUTCHours()).padStart(2, "0")}h${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
export function slugify(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";
}
export function maskPhone(p: string): string {
  if (p.length < 6) return p;
  return `${p.slice(0, 2)}••••${p.slice(-3)}`;
}
export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}
