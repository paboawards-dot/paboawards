import { createClient } from "@supabase/supabase-js";

/** Client "lecture publique" (clé anon). Les réponses sont mises en cache quelques secondes pour rester rapide. */
export function publicClient(revalidate = 20) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: ((input: any, init?: any) => fetch(input, { ...(init || {}), next: { revalidate } })) as typeof fetch,
    },
  });
}
