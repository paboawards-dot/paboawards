export function Trophy({ className = "", glow = true }: { className?: string; glow?: boolean }) {
  const star = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 11 : 26;
    return `${(60 + r * Math.cos(a)).toFixed(1)},${(30 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 120 170" className={className} role="img" aria-label="Trophée PABO AWARDS" style={glow ? { filter: "drop-shadow(0 0 22px rgba(255,201,74,.55))" } : undefined}>
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset=".45" stopColor="#ffc94a" />
          <stop offset="1" stopColor="#c77700" />
        </linearGradient>
        <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#d98a00" />
        </linearGradient>
      </defs>
      <polygon points={star} fill="url(#tg)" stroke="#fff3b0" strokeWidth="1" strokeLinejoin="round" />
      <path d="M36 66h48c0 28-9 42-24 48-15-6-24-20-24-48Z" fill="url(#tg2)" />
      <path d="M36 72c-14 0-18 6-16 14 2 8 10 12 20 14M84 72c14 0 18 6 16 14-2 8-10 12-20 14" fill="none" stroke="url(#tg)" strokeWidth="5" strokeLinecap="round" />
      <path d="M46 70c0 22 5 34 14 40" fill="none" stroke="#fff6c9" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
      <rect x="54" y="114" width="12" height="18" rx="3" fill="url(#tg)" />
      <rect x="38" y="132" width="44" height="12" rx="4" fill="url(#tg2)" />
      <rect x="30" y="144" width="60" height="12" rx="4" fill="url(#tg)" />
    </svg>
  );
}
