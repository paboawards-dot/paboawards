import Link from "next/link";
import { StateScreen } from "@/components/StateScreen";

export default function NotFound() {
  return (
    <StateScreen icon="🧭" title="Page introuvable" text="Cette page n’existe pas. Retourne voter !">
      <Link href="/voter" className="btn-vote">Voter</Link>
      <Link href="/" className="btn-ghost">Accueil</Link>
    </StateScreen>
  );
}
