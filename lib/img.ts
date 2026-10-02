import { siteUrl } from "./config";

/** Télécharge une image (JPG/PNG) et la convertit en data-URL pour la générer dans une image serveur. */
export async function fetchDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  const abs = url.startsWith("/") ? `${siteUrl()}${url}` : url;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 6000);
  try {
    const r = await fetch(abs, { signal: ctl.signal, cache: "force-cache" });
    if (!r.ok) return null;
    const type = (r.headers.get("content-type") || "").split(";")[0];
    if (type !== "image/jpeg" && type !== "image/png") return null;
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 3 * 1024 * 1024) return null;
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
