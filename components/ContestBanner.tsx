import { contestInfo } from "@/lib/status";
import type { Settings } from "@/lib/types";

export function ContestBanner({ settings }: { settings: Settings | null }) {
  const info = contestInfo(settings);
  if (info.state === "open") return null;
  const cls = info.state === "soon" ? "border-gold/50 bg-gold/10 text-gold" : "border-coral/60 bg-coral/10 text-red-200";
  return (
    <div className="container-x pt-4">
      <p className={`rounded-2xl border px-4 py-3 text-center text-lg font-bold ${cls}`}>
        {info.state === "soon" ? "⏳" : "🔒"} {info.label} — {info.state === "soon" ? "tu peux découvrir les artistes en attendant." : info.hint}
      </p>
    </div>
  );
}
