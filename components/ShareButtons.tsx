"use client";
import { IconShare } from "./Icons";

export function ShareButtons({ path, text }: { path: string; text: string }) {
  const url = () => `${window.location.origin}${path}`;
  const enc = encodeURIComponent;
  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "PABO AWARDS", text, url: url() });
        return;
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
    window.open(`https://wa.me/?text=${enc(`${text} ${url()}`)}`, "_blank", "noopener,noreferrer");
  }
  const open = (href: (u: string) => string) => () => window.open(href(url()), "_blank", "noopener,noreferrer");
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-ghost" onClick={nativeShare}><IconShare size={20} /> Partager</button>
      <button type="button" className="btn-ghost" onClick={open((u) => `https://wa.me/?text=${enc(`${text} ${u}`)}`)}>WhatsApp</button>
      <button type="button" className="btn-ghost" onClick={open((u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}`)}>Facebook</button>
    </div>
  );
}
