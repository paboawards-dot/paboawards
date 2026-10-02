import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Client serveur lié à la session de connexion (sert uniquement à identifier l'admin). */
export function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* appelé depuis un composant serveur : ignoré (le middleware rafraîchit la session) */
        }
      },
    },
  });
}
