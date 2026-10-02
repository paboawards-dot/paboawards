"use client";
import { useEffect, useRef, useState } from "react";
import { num } from "@/lib/format";

export function StatCounter({ value, label, icon }: { value: number; label: string; icon: string }) {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || value === 0) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1400;
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <div ref={ref} className="glass rounded-3xl p-5 text-center">
      <div className="text-3xl" aria-hidden>{icon}</div>
      <div className="font-title mt-1 text-5xl leading-none text-gold-grad sm:text-6xl">{num(shown)}</div>
      <div className="mt-1 text-sm font-bold uppercase tracking-widest text-white/75">{label}</div>
    </div>
  );
}
