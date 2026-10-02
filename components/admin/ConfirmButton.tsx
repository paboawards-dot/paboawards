"use client";

/** Bouton d'action sensible avec confirmation (utilisé dans un <form action={...}>). */
export function ConfirmButton({ children, message, className = "adm-btn-danger" }: { children: React.ReactNode; message: string; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
