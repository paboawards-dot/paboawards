import { NextResponse } from "next/server";
import { verifyAndApply } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// CinetPay vérifie parfois l'URL avec un GET : on répond 200.
export async function GET() {
  return new NextResponse("OK", { status: 200 });
}

/**
 * Notification de paiement. Le contenu reçu n'est jamais cru tel quel :
 * on relit le statut auprès de CinetPay (verifyAndApply), puis on crédite une seule fois.
 */
export async function POST(req: Request) {
  let ref = "";
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await req.json();
      ref = String(j?.cpm_trans_id || j?.transaction_id || "");
    } else {
      const fd = await req.formData();
      ref = String(fd.get("cpm_trans_id") || fd.get("transaction_id") || "");
    }
  } catch {
    /* corps illisible : on répond quand même 200 */
  }
  if (/^PABO[A-Z0-9]{12}$/.test(ref)) {
    try {
      await verifyAndApply(ref);
    } catch {
      /* la page de retour refera la vérification */
    }
  }
  return new NextResponse("OK", { status: 200 });
}
