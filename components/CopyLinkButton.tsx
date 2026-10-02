"use client";
import { useRef, useState } from "react";
import { IconCheck, IconCopy } from "./Icons";

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* on tente la méthode de secours */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Copie le lien unique SANS quitter la page. */
export function CopyLinkButton({ path, className = "btn-ghost", label = "COPIER LE LIEN", small = false }: { path: string; className?: string; label?: string; small?: boolean }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  return (
    <button
      type="button"
      className={`${className} ${small ? "!min-h-[44px] !px-3 !text-sm" : ""} ${state === "ok" ? "!border-emerald-400 !bg-emerald-500/20 !text-emerald-200" : ""}`}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = await copyText(`${window.location.origin}${path}`);
        setState(ok ? "ok" : "err");
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setState("idle"), 2200);
      }}
      aria-live="polite"
    >
      {state === "ok" ? <IconCheck size={18} /> : <IconCopy size={18} />}
      <span>{state === "ok" ? "Lien copié" : state === "err" ? "Copie impossible" : label}</span>
    </button>
  );
}
