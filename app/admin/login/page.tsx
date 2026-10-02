"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabase/browser";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const sb = browserClient();
    if (!sb) {
      setError("Connexion indisponible : variables Supabase manquantes.");
      setBusy(false);
      return;
    }
    const { error: err } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setError("E-mail ou mot de passe incorrect.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="adm-card w-full max-w-sm space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">PABO AWARDS</p>
          <h1 className="text-2xl font-extrabold">Administration</h1>
        </div>
        <div>
          <label htmlFor="email" className="adm-label">E-mail</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="adm-input" />
        </div>
        <div>
          <label htmlFor="pw" className="adm-label">Mot de passe</label>
          <input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="adm-input" />
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="adm-btn w-full">{busy ? "Connexion…" : "Se connecter"}</button>
      </form>
    </div>
  );
}
