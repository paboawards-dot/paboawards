"use client";
import { useRef, useState } from "react";

async function compress(file: File, keepAlpha: boolean): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, ko) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => ko(new Error("Image illisible"));
      i.src = url;
    });
    const max = 1600;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    if (!keepAlpha) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    const type = keepAlpha ? "image/png" : "image/jpeg";
    let q = 0.86;
    let blob: Blob | null = await new Promise((r) => canvas.toBlob(r, type, q));
    while (blob && blob.size > 4.5 * 1024 * 1024 && q > 0.5 && !keepAlpha) {
      q -= 0.12;
      blob = await new Promise((r) => canvas.toBlob(r, type, q));
    }
    if (!blob) throw new Error("Compression impossible");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function upload(file: File, folder: string, keepAlpha: boolean): Promise<string> {
  const blob = await compress(file, keepAlpha);
  const fd = new FormData();
  fd.append("file", new File([blob], keepAlpha ? "image.png" : "image.jpg", { type: blob.type }));
  fd.append("folder", folder);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.url) throw new Error(j.error || "Envoi impossible");
  return j.url as string;
}

/** Ajout / remplacement / suppression d'images (images uniquement — aucune vidéo). */
export function ImageUploader({ name, label, initial = [], multiple = false, folder = "divers", keepAlpha = false, hint }: { name: string; label: string; initial?: string[]; multiple?: boolean; folder?: string; keepAlpha?: boolean; hint?: string }) {
  const [urls, setUrls] = useState<string[]>(initial.filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceIdx = useRef<number>(-1);

  async function handle(files: FileList | null, replace = -1) {
    if (!files || !files.length) return;
    setErr("");
    setBusy(true);
    try {
      const out: string[] = [];
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) throw new Error("Seules les images sont acceptées.");
        out.push(await upload(f, folder, keepAlpha));
        if (!multiple) break;
      }
      setUrls((cur) => {
        if (!multiple) return [out[0]];
        if (replace >= 0) {
          const n = [...cur];
          n[replace] = out[0];
          return n;
        }
        return [...cur, ...out];
      });
    } catch (e) {
      setErr((e as Error).message || "Erreur");
    }
    setBusy(false);
    if (addRef.current) addRef.current.value = "";
    if (replaceRef.current) replaceRef.current.value = "";
  }

  return (
    <div>
      <span className="adm-label">{label}</span>
      {urls.map((u) => <input key={u} type="hidden" name={name} value={u} />)}
      <div className="flex flex-wrap gap-3">
        {urls.map((u, i) => (
          <div key={u + i} className="group relative h-28 w-28 overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/60 p-1">
              <button type="button" className="flex-1 rounded bg-white/90 py-1 text-[11px] font-bold text-slate-800" onClick={() => { replaceIdx.current = i; replaceRef.current?.click(); }}>Remplacer</button>
              <button type="button" className="rounded bg-red-600 px-2 py-1 text-[11px] font-bold text-white" aria-label="Supprimer l’image" onClick={() => setUrls((c) => c.filter((_, k) => k !== i))}>✕</button>
            </div>
          </div>
        ))}
        {(multiple || urls.length === 0) && (
          <button type="button" disabled={busy} onClick={() => addRef.current?.click()} className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50">
            <span className="text-2xl">{busy ? "⏳" : "＋"}</span>
            {busy ? "Envoi…" : "Ajouter"}
          </button>
        )}
      </div>
      <input ref={addRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} className="hidden" onChange={(e) => handle(e.target.files)} />
      <input ref={replaceRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => (multiple ? handle(e.target.files, replaceIdx.current) : handle(e.target.files))} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {err && <p role="alert" className="mt-1 text-sm font-semibold text-red-600">{err}</p>}
    </div>
  );
}
