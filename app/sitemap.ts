import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { getCandidates } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ["", "/categories", "/artistes", "/classement", "/actualites", "/comment-ca-marche", "/reglement", "/a-propos", "/partenaires", "/contact"];
  const cands = await getCandidates();
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.7 })),
    ...cands.map((c) => ({ url: `${base}/artistes/${c.slug}`, changeFrequency: "hourly" as const, priority: 0.8 })),
  ];
}
