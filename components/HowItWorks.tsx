import { Reveal } from "./Reveal";

const STEPS = [
  { n: 1, icon: "📸", title: "Choisis ton artiste", text: "Trouve-le par son nom ou sa catégorie." },
  { n: 2, icon: "🔢", title: "Choisis le nombre de votes", text: "100 FCFA = 1 vote." },
  { n: 3, icon: "📲", title: "Paye avec ton téléphone", text: "Orange, MTN, Moov ou Wave." },
  { n: 4, icon: "🎉", title: "Partage ta carte de vote", text: "Ta preuve de vote, prête à partager." },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <li key={s.n}>
          <Reveal delay={i * 90} className="h-full">
            <div className="glass relative flex h-full items-center gap-4 rounded-3xl p-5 sm:flex-col sm:text-center">
              <span className="font-title absolute right-4 top-2 text-6xl text-white/10">{s.n}</span>
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet/60 to-electric/60 text-5xl">{s.icon}</span>
              <div>
                <p className="text-xl font-extrabold leading-tight">{s.title}</p>
                <p className="mt-1 text-white/70">{s.text}</p>
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
