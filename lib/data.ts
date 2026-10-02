import { publicClient } from "./supabase/public";
import type { Candidate, Category, News, Partner, RankedCandidate, Settings, Stats, Universe } from "./types";

async function safe<T>(fn: () => PromiseLike<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getSettings(): Promise<Settings | null> {
  const c = publicClient(15);
  if (!c) return null;
  return safe(async () => {
    const { data } = await c.from("settings").select("*").eq("id", 1).maybeSingle();
    return (data as Settings) || null;
  }, null);
}

export async function getUniverses(): Promise<Universe[]> {
  const c = publicClient(300);
  if (!c) return [];
  return safe(async () => {
    const { data } = await c.from("universes").select("*").order("sort");
    return (data as Universe[]) || [];
  }, []);
}

export async function getCategories(): Promise<Category[]> {
  const c = publicClient(30);
  if (!c) return [];
  return safe(async () => {
    const { data } = await c.from("categories").select("*").order("sort");
    return (data as Category[]) || [];
  }, []);
}

export function withRanks(list: Candidate[]): RankedCandidate[] {
  const byCat = new Map<string, Candidate[]>();
  for (const c of list) {
    const arr = byCat.get(c.category_id) || [];
    arr.push(c);
    byCat.set(c.category_id, arr);
  }
  const out: RankedCandidate[] = [];
  byCat.forEach((arr) => {
    arr.sort((a, b) => b.votes_count - a.votes_count || a.name.localeCompare(b.name));
    let rank = 0;
    let last = -1;
    arr.forEach((c, i) => {
      if (c.votes_count !== last) {
        rank = i + 1;
        last = c.votes_count;
      }
      out.push({ ...c, rank });
    });
  });
  return out;
}

export async function getCandidates(): Promise<RankedCandidate[]> {
  const c = publicClient(15);
  if (!c) return [];
  return safe(async () => {
    const { data } = await c.from("candidates").select("*").eq("status", "active").order("name");
    return withRanks((data as Candidate[]) || []);
  }, []);
}

export async function getCandidateBySlug(slug: string): Promise<RankedCandidate | null> {
  const all = await getCandidates();
  return all.find((x) => x.slug === slug) || null;
}

export async function getNews(limit = 20): Promise<News[]> {
  const c = publicClient(60);
  if (!c) return [];
  return safe(async () => {
    const { data } = await c.from("news").select("*").eq("published", true).order("published_at", { ascending: false }).limit(limit);
    return (data as News[]) || [];
  }, []);
}

export async function getNewsItem(id: string): Promise<News | null> {
  const c = publicClient(60);
  if (!c) return null;
  return safe(async () => {
    const { data } = await c.from("news").select("*").eq("id", id).eq("published", true).maybeSingle();
    return (data as News) || null;
  }, null);
}

export async function getPartners(): Promise<Partner[]> {
  const c = publicClient(120);
  if (!c) return [];
  return safe(async () => {
    const { data } = await c.from("partners").select("*").eq("visible", true).order("sort");
    return (data as Partner[]) || [];
  }, []);
}

export async function getStats(): Promise<Stats> {
  const empty: Stats = { votes: 0, voters: 0, artists: 0, categories: 0 };
  const c = publicClient(20);
  if (!c) return empty;
  return safe(async () => {
    const { data } = await c.rpc("public_stats");
    const d = (data || {}) as Partial<Stats>;
    return { votes: Number(d.votes || 0), voters: Number(d.voters || 0), artists: Number(d.artists || 0), categories: Number(d.categories || 0) };
  }, empty);
}
