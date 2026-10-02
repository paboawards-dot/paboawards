export function PageHead({ kicker, title, text }: { kicker?: string; title: string; text?: string }) {
  return (
    <header className="container-x pb-4 pt-8 sm:pt-12">
      {kicker && <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.3em] text-gold">{kicker}</p>}
      <h1 className="font-title text-5xl uppercase leading-none sm:text-7xl">{title}</h1>
      {text && <p className="mt-3 max-w-2xl text-lg text-white/75">{text}</p>}
    </header>
  );
}
