import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/admin";
import { verifyAndApply } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get("ref") || "";
  if (!/^PABO[A-Z0-9]{12}$/.test(ref)) return NextResponse.json({ status: "not_found" }, { status: 404 });
  const result = await verifyAndApply(ref, { throttleMs: 3000 });
  const db = serviceClient();
  let status: string = result;
  if (db) {
    const { data } = await db.from("transactions").select("status").eq("ref", ref).maybeSingle();
    if (data?.status) status = data.status;
  }
  if (status === "already") status = "confirmed";
  return NextResponse.json({ status }, { headers: { "Cache-Control": "no-store" } });
}
