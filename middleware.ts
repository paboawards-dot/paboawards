import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Ne s'exécute QUE sur l'administration : le site public n'est jamais ralenti.
 * Vérifie qu'une session existe ; l'autorisation "admin" est revérifiée côté serveur dans chaque page/action.
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path === "/admin/login") return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const deny = () =>
    path.startsWith("/api/")
      ? NextResponse.json({ error: "unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/admin/login", req.url));
  if (!url || !key) return deny();

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(list) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return deny();
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
