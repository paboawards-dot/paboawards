"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdmin, audit } from "@/lib/admin-auth";
import { serviceClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/format";

async function ctx() {
  const admin = await getAdmin();
  const db = serviceClient();
  if (!admin || !db) redirect("/admin/login");
  return { admin: admin!, db: db! };
}

function back(path: string, kind: "ok" | "err", msg: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`);
}

function refreshPublic() {
  revalidatePath("/", "layout");
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const strOrNull = (f: FormData, k: string) => str(f, k) || null;
const list = (f: FormData, k: string) => f.getAll(k).map((v) => String(v).trim()).filter(Boolean);
const dt = (f: FormData, k: string) => {
  const v = str(f, k);
  if (!v) return null;
  const d = new Date(`${v}:00Z`);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

async function uniqueSlug(db: NonNullable<ReturnType<typeof serviceClient>>, table: "candidates" | "categories", base: string) {
  let slug = slugify(base);
  for (let i = 2; i < 50; i++) {
    const { data } = await db.from(table).select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${slugify(base)}-${i}`;
  }
  return `${slugify(base)}-${Date.now()}`;
}

// ---------------- Candidats ----------------
export async function saveCandidate(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  const name = str(f, "name");
  const category_id = str(f, "category_id");
  const back_ = id ? `/admin/candidats/${id}` : "/admin/candidats/nouveau";
  if (!name || !category_id) back(back_, "err", "Le nom et la catégorie sont obligatoires.");
  const payload = {
    name, category_id, bio: strOrNull(f, "bio"), info: strOrNull(f, "info"),
    status: str(f, "status") === "hidden" ? "hidden" : "active",
    photo_url: strOrNull(f, "photo_url"), gallery: list(f, "gallery"),
  };
  if (id) {
    const { error } = await db.from("candidates").update(payload).eq("id", id);
    if (error) back(back_, "err", error.message);
    await audit(admin.email, "candidat.modifier", "candidate", id, { name });
  } else {
    const slug = await uniqueSlug(db, "candidates", name);
    const { data, error } = await db.from("candidates").insert({ ...payload, slug }).select("id").single();
    if (error) back(back_, "err", error.message);
    await audit(admin.email, "candidat.créer", "candidate", data!.id, { name });
  }
  refreshPublic();
  back("/admin/candidats", "ok", "Candidat enregistré.");
}

export async function deleteCandidate(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  const { count } = await db.from("transactions").select("id", { count: "exact", head: true }).eq("candidate_id", id);
  if ((count || 0) > 0) back("/admin/candidats", "err", "Ce candidat a déjà des transactions : masque-le au lieu de le supprimer.");
  const { error } = await db.from("candidates").delete().eq("id", id);
  if (error) back("/admin/candidats", "err", error.message);
  await audit(admin.email, "candidat.supprimer", "candidate", id);
  refreshPublic();
  back("/admin/candidats", "ok", "Candidat supprimé.");
}

// ---------------- Catégories ----------------
export async function saveCategory(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  const name = str(f, "name");
  if (!name) back("/admin/categories", "err", "Le nom est obligatoire.");
  const payload = {
    name, universe_id: Number(str(f, "universe_id")) || 1, color: str(f, "color") || "#8b5cf6",
    emoji: str(f, "emoji") || "🏆", image_url: strOrNull(f, "image_url"), sort: Number(str(f, "sort")) || 0,
  };
  if (id) {
    const { error } = await db.from("categories").update(payload).eq("id", id);
    if (error) back("/admin/categories", "err", error.message);
    await audit(admin.email, "catégorie.modifier", "category", id, { name });
  } else {
    const slug = await uniqueSlug(db, "categories", name);
    const { data, error } = await db.from("categories").insert({ ...payload, slug }).select("id").single();
    if (error) back("/admin/categories", "err", error.message);
    await audit(admin.email, "catégorie.créer", "category", data!.id, { name });
  }
  refreshPublic();
  back("/admin/categories", "ok", "Catégorie enregistrée.");
}

export async function setCategoryStatus(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  const status = str(f, "status") === "closed" ? "closed" : "open";
  const { error } = await db.from("categories").update({ status }).eq("id", id);
  if (error) back("/admin/categories", "err", error.message);
  await audit(admin.email, status === "closed" ? "catégorie.fermer" : "catégorie.ouvrir", "category", id);
  refreshPublic();
  back("/admin/categories", "ok", status === "closed" ? "Catégorie fermée." : "Catégorie ouverte.");
}

export async function extendCategory(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  const until = dt(f, "extended_until");
  const { error } = await db.from("categories").update({ extended_until: until, ...(until ? { status: "open" } : {}) }).eq("id", id);
  if (error) back("/admin/categories", "err", error.message);
  await audit(admin.email, until ? "catégorie.prolonger" : "catégorie.fin-prolongation", "category", id, { until });
  refreshPublic();
  back("/admin/categories", "ok", until ? "Catégorie prolongée." : "Prolongation retirée.");
}

export async function deleteCategory(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  const { count } = await db.from("candidates").select("id", { count: "exact", head: true }).eq("category_id", id);
  if ((count || 0) > 0) back("/admin/categories", "err", "Cette catégorie contient des candidats : impossible de la supprimer.");
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) back("/admin/categories", "err", error.message);
  await audit(admin.email, "catégorie.supprimer", "category", id);
  refreshPublic();
  back("/admin/categories", "ok", "Catégorie supprimée.");
}

// ---------------- Actualités ----------------
export async function saveNews(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  const title = str(f, "title");
  const back_ = id ? `/admin/actualites/${id}` : "/admin/actualites/nouveau";
  if (!title) back(back_, "err", "Le titre est obligatoire.");
  const payload = { title, body: strOrNull(f, "body"), images: list(f, "images"), published: f.get("published") === "on" };
  if (id) {
    const { error } = await db.from("news").update(payload).eq("id", id);
    if (error) back(back_, "err", error.message);
    await audit(admin.email, "actualité.modifier", "news", id, { title });
  } else {
    const { data, error } = await db.from("news").insert(payload).select("id").single();
    if (error) back(back_, "err", error.message);
    await audit(admin.email, "actualité.créer", "news", data!.id, { title });
  }
  refreshPublic();
  back("/admin/actualites", "ok", "Actualité enregistrée.");
}

export async function deleteNews(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  await db.from("news").delete().eq("id", id);
  await audit(admin.email, "actualité.supprimer", "news", id);
  refreshPublic();
  back("/admin/actualites", "ok", "Actualité supprimée.");
}

// ---------------- Partenaires ----------------
export async function savePartner(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  const name = str(f, "name");
  const back_ = id ? `/admin/partenaires/${id}` : "/admin/partenaires/nouveau";
  if (!name) back(back_, "err", "Le nom est obligatoire.");
  const payload = {
    name, role: strOrNull(f, "role"), description: strOrNull(f, "description"), logo_url: strOrNull(f, "logo_url"),
    images: list(f, "images"), visible: f.get("visible") === "on", sort: Number(str(f, "sort")) || 0,
  };
  if (id) {
    const { error } = await db.from("partners").update(payload).eq("id", id);
    if (error) back(back_, "err", error.message);
    await audit(admin.email, "partenaire.modifier", "partner", id, { name });
  } else {
    const { data, error } = await db.from("partners").insert(payload).select("id").single();
    if (error) back(back_, "err", error.message);
    await audit(admin.email, "partenaire.créer", "partner", data!.id, { name });
  }
  refreshPublic();
  back("/admin/partenaires", "ok", "Partenaire enregistré.");
}

export async function deletePartner(f: FormData) {
  const { admin, db } = await ctx();
  const id = str(f, "id");
  await db.from("partners").delete().eq("id", id);
  await audit(admin.email, "partenaire.supprimer", "partner", id);
  refreshPublic();
  back("/admin/partenaires", "ok", "Partenaire supprimé.");
}

// ---------------- Paramètres & ouverture des votes ----------------
export async function toggleVotes(f: FormData) {
  const { admin, db } = await ctx();
  const enabled = str(f, "enabled") === "1";
  const { error } = await db.from("settings").update({ votes_enabled: enabled, updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) back("/admin", "err", error.message);
  await audit(admin.email, enabled ? "votes.ouvrir" : "votes.fermer", "settings", "1");
  refreshPublic();
  back("/admin", "ok", enabled ? "Votes ouverts." : "Votes fermés.");
}

export async function saveSettings(f: FormData) {
  const { admin, db } = await ctx();
  const max = str(f, "max_votes_per_payment");
  const payload = {
    selections_at: dt(f, "selections_at"), votes_open_at: dt(f, "votes_open_at"),
    votes_close_at: dt(f, "votes_close_at"), ceremony_at: dt(f, "ceremony_at"),
    max_votes_per_payment: max ? Math.max(1, Number(max)) : null,
    contact_phone: strOrNull(f, "contact_phone"), contact_whatsapp: strOrNull(f, "contact_whatsapp"),
    contact_email: strOrNull(f, "contact_email"), facebook_url: strOrNull(f, "facebook_url"),
    instagram_url: strOrNull(f, "instagram_url"), tiktok_url: strOrNull(f, "tiktok_url"),
    updated_at: new Date().toISOString(),
  };
  const { error } = await db.from("settings").update(payload).eq("id", 1);
  if (error) back("/admin/parametres", "err", error.message);
  await audit(admin.email, "paramètres.modifier", "settings", "1", payload as Record<string, unknown>);
  refreshPublic();
  back("/admin/parametres", "ok", "Paramètres enregistrés.");
}

export async function signOutAdmin() {
  const { authClient } = await import("@/lib/supabase/server");
  const c = authClient();
  await c?.auth.signOut();
  redirect("/admin/login");
}

// ---------------- Rapprochement des paiements en attente ----------------
export async function reconcilePending() {
  const { admin, db } = await ctx();
  const { verifyAndApply } = await import("@/lib/payments");
  const { data } = await db.from("transactions").select("ref").in("status", ["pending", "expired", "failed"]).gte("created_at", new Date(Date.now() - 3 * 86400000).toISOString()).order("created_at", { ascending: false }).limit(30);
  let confirmed = 0;
  for (const t of data || []) {
    const r = await verifyAndApply(t.ref);
    if (r === "confirmed") confirmed++;
  }
  await audit(admin.email, "paiements.rapprocher", "transactions", undefined, { checked: data?.length || 0, confirmed });
  refreshPublic();
  back("/admin", "ok", `${data?.length || 0} paiement(s) vérifié(s), ${confirmed} confirmé(s).`);
}
