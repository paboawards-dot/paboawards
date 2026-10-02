import { redirect } from "next/navigation";
import { authClient } from "./supabase/server";
import { serviceClient } from "./supabase/admin";

export type AdminUser = { id: string; email: string };

/** Retourne l'admin connecté ET autorisé (présent dans la table admin_users), sinon null. */
export async function getAdmin(): Promise<AdminUser | null> {
  const auth = authClient();
  const svc = serviceClient();
  if (!auth || !svc) return null;
  const { data } = await auth.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const { data: row } = await svc.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!row) return null;
  return { id: user.id, email: user.email || "" };
}

export async function requireAdmin(): Promise<AdminUser> {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

export async function audit(actor: string, action: string, entity?: string, entityId?: string, details?: Record<string, unknown>) {
  const svc = serviceClient();
  if (!svc) return;
  await svc.from("audit_log").insert({ actor, action, entity: entity || null, entity_id: entityId || null, details: details || null });
}
