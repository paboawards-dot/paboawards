"use client";

export function fireConfetti(count = 42) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  if (document.documentElement.hasAttribute("data-lite")) count = 14;
  const colors = ["#ffc94a", "#ff5a3c", "#8b5cf6", "#2f6bff", "#ffffff", "#22c55e"];
  const frag = document.createDocumentFragment();
  const pieces: HTMLElement[] = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("i");
    p.className = "confetti-piece";
    p.style.left = `${Math.random() * 100}vw`;
    p.style.background = colors[i % colors.length];
    p.style.borderRadius = i % 3 === 0 ? "9999px" : "2px";
    p.style.setProperty("--x", `${(Math.random() - 0.5) * 240}px`);
    p.style.animationDuration = `${1.8 + Math.random() * 1.6}s`;
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    frag.appendChild(p);
    pieces.push(p);
  }
  document.body.appendChild(frag);
  setTimeout(() => pieces.forEach((p) => p.remove()), 4200);
}
