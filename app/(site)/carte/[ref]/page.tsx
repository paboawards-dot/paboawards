import type { Metadata } from "next";
import Link from "next/link";
import { serviceClient } from "@/lib/supabase/admin";
import { StateScreen } from "@/components/StateScreen";
import { VoteStatus } from "@/components/VoteStatus";
import { verifyAndApply } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ma carte de vote", robots: { index: false, follow: false } };

export default async function CardPage({ params }: { params: { ref: string } }) {
  const ref = params.ref;
  const db = serviceClient();
  const notFound = (
    <StateScreen icon="🔎" title="Vote introuvable" text="Ce numéro de transaction n’existe pas.">
      <Link href="/voter" className="btn-vote">Voter</Link>
    </StateScreen>
  );
  if (!/^PABO[A-Z0-9]{12}$/.test(ref)) return notFound;
  if (!db) return <StateScreen icon="🛠️" title="Service indisponible" text="Réessaie dans quelques instants." tone="bad" />;

  let { data: tx } = await db.from("transactions").select("ref,status,votes,amount,candidate_id").eq("ref", ref).maybeSingle();
  if (!tx) return notFound;
  if (tx.status === "pending") {
    await verifyAndApply(ref, { throttleMs: 2000 });
    const r = await db.from("transactions").select("ref,status,votes,amount,candidate_id").eq("ref", ref).maybeSingle();
    tx = r.data || tx;
  }
  const { data: cand } = await db.from("candidates").select("name,slug").eq("id", tx.candidate_id).maybeSingle();
  if (!cand) return notFound;

  return <VoteStatus tx={tx.ref} initialStatus={tx.status} candidate={cand} votes={tx.votes} amount={tx.amount} />;
}
