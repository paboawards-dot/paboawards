import type { ReactNode } from "react";

/** Écran d'état (erreur, fermé, vide…) : icône + phrase courte, jamais de message technique. */
export function StateScreen({ icon, title, text, children, tone = "neutral" }: { icon: ReactNode; title: string; text?: string; children?: ReactNode; tone?: "neutral" | "good" | "bad" | "wait" }) {
  const ring = { neutral: "from-violet/60 to-electric/60", good: "from-emerald-400/70 to-gold/70", bad: "from-coral/70 to-red-600/70", wait: "from-sun/70 to-gold/70" }[tone];
  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-12">
      <div className="glass w-full max-w-md animate-popIn rounded-3xl p-8 text-center">
        <div className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${ring} text-5xl`}>{icon}</div>
        <h1 className="font-title text-4xl uppercase leading-none">{title}</h1>
        {text && <p className="mt-3 text-lg text-white/75">{text}</p>}
        {children && <div className="mt-6 flex flex-col gap-3">{children}</div>}
      </div>
    </div>
  );
}
