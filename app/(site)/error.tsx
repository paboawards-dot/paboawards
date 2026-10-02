"use client";
import { StateScreen } from "@/components/StateScreen";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <StateScreen icon="🛠️" title="Petit souci" text="Un problème temporaire est survenu. Réessaie dans un instant." tone="bad">
      <button type="button" onClick={reset} className="btn-vote">Réessayer</button>
    </StateScreen>
  );
}
