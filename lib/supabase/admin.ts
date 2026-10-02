import { createClient } from "@supabase/supabase-js";

/** Client SERVEUR uniquement (clé service_role). Ne jamais l'importer dans un composant "use client". */
export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: ((input: any, init?: any) => fetch(input, { ...(init || {}), cache: "no-store" })) as typeof fetch,
    },
  });
}
