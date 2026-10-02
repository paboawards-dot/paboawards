import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { verifyAndApply } from "@/lib/payments";
import { serviceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// CinetPay vérifie parfois l'URL avec un GET : on répond 200.
export async function GET() {
  return new NextResponse("OK", { status: 200 });
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Notification de paiement (API CinetPay v1).
 * Le contenu reçu n'est jamais cru tel quel : on contrôle le notify_token enregistré
 * à l'initialisation, puis on relit le statut auprès de CinetPay (verifyAndApply).
 */
export async function POST(req: Request) {
  let ref = "";
  let token = "";
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j: any = await req.json();
      const d = j?.data ?? j;
      ref = String(d?.merchant_transaction_id || j?.merchant_transaction_id || "");
      token = String(d?.notify_token || j?.notify_token || "");
    } else {
      const fd = await req.formData();
      ref = String(fd.get("merchant_transaction_id") || "");
      token = String(fd.get("notify_token") || "");
    }
  } catch {
    /* corps illisible : on répond quand même 200 */
  }
  if (/^PABO[A-Z0-9]{12}$/.test(ref)) {
    try {
      const db = serviceClient();
      if (db) {
        const { data: tx } = await db.from("transactions").select("notify_token").eq("ref", ref).maybeSingle();
        const stored = (tx as any)?.notify_token as string | null | undefined;
        if (stored && !same(stored, token)) {
          return new NextResponse("Unauthorized", { status: 401 });
        }
      }
      await verifyAndApply(ref);
    } catch {
      /* la page de retour refera la vérification */
    }
  }
  return new NextResponse("OK", { status: 200 });
}
