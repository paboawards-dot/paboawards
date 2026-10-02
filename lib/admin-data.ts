import { serviceClient } from "./supabase/admin";
import type { Candidate, Category, News, Partner, Settings, Universe } from "./types";

export type AdminStats = {
  votes: number; revenue: number; confirmed: number; pending: number; failed: number; flagged: number; voters: number;
  per_category: { category_id: string; votes: number; revenue: number }[];
  daily: { day: string; revenue: number; votes: number }[];
};

export async function adminDb() {
  const db = serviceClient();
  if (!db) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante");
  return db;
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = await adminDb();
  const { data } = await db.rpc("admin_stats");
  const d = (data || {}) as Partial<AdminStats>;
  return {
    votes: Number(d.votes || 0), revenue: Number(d.revenue || 0), confirmed: Number(d.confirmed || 0), pending: Number(d.pending || 0),
    failed: Number(d.failed || 0), flagged: Number(d.flagged || 0), voters: Number(d.voters || 0),
    per_category: (d.per_category || []).map((x) => ({ category_id: x.category_id, votes: Number(x.votes), revenue: Number(x.revenue) })),
    daily: (d.daily || []).map((x) => ({ day: x.day, revenue: Number(x.revenue), votes: Number(x.votes) })),
  };
}

export async function adminSettings(): Promise<Settings | null> {
  const db = await adminDb();
  const { data } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
  return (data as Settings) || null;
}
export async function adminUniverses(): Promise<Universe[]> {
  const db = await adminDb();
  const { data } = await db.from("universes").select("*").order("sort");
  return (data as Universe[]) || [];
}
export async function adminCategories(): Promise<Category[]> {
  const db = await adminDb();
  const { data } = await db.from("categories").select("*").order("sort");
  return (data as Category[]) || [];
}
export async function adminCandidates(): Promise<Candidate[]> {
  const db = await adminDb();
  const { data } = await db.from("candidates").select("*").order("name");
  return (data as Candidate[]) || [];
}
export async function adminNews(): Promise<News[]> {
  const db = await adminDb();
  const { data } = await db.from("news").select("*").order("published_at", { ascending: false });
  return (data as News[]) || [];
}
export async function adminPartners(): Promise<Partner[]> {
  const db = await adminDb();
  const { data } = await db.from("partners").select("*").order("sort");
  return (data as Partner[]) || [];
}
export const toLocalInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : "");
