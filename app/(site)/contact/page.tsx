import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { getSettings } from "@/lib/data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Contact", description: "Contacte l’équipe des PABO AWARDS." };

export default async function ContactPage() {
  const s = await getSettings();
  const phone = s?.contact_phone || "+225 07 18 27 57 97";
  const wa = (s?.contact_whatsapp || "2250718275797").replace(/\D/g, "");
  const items = [
    { icon: "📞", label: "Appeler", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { icon: "💬", label: "WhatsApp", value: "Écrire un message", href: `https://wa.me/${wa}` },
    { icon: "👍", label: "Facebook", value: "PABO AWARDS", href: s?.facebook_url || null },
    ...(s?.instagram_url ? [{ icon: "📷", label: "Instagram", value: s.instagram_url, href: s.instagram_url }] : []),
    ...(s?.tiktok_url ? [{ icon: "🎵", label: "TikTok", value: s.tiktok_url, href: s.tiktok_url }] : []),
    ...(s?.contact_email ? [{ icon: "✉️", label: "E-mail", value: s.contact_email, href: `mailto:${s.contact_email}` }] : []),
  ];
  return (
    <>
      <PageHead kicker="On te répond" title="Contact" text="Un souci avec un paiement ? Garde ton numéro de transaction et écris-nous." />
      <div className="container-x grid gap-4 py-6 sm:grid-cols-2">
        {items.map((it) => {
          const inner = (
            <>
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet/60 to-electric/60 text-4xl">{it.icon}</span>
              <span className="min-w-0"><span className="block text-sm font-bold uppercase tracking-widest text-gold">{it.label}</span><span className="block truncate text-xl font-extrabold">{it.value}</span></span>
            </>
          );
          return it.href ? (
            <a key={it.label} href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="glass flex items-center gap-4 rounded-3xl p-5 transition hover:-translate-y-1">{inner}</a>
          ) : (
            <div key={it.label} className="glass flex items-center gap-4 rounded-3xl p-5">{inner}</div>
          );
        })}
        <div className="glass flex items-center gap-4 rounded-3xl p-5 sm:col-span-2">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-4xl">📍</span>
          <p className="text-xl font-extrabold">Bounkani, Côte d’Ivoire</p>
        </div>
      </div>
    </>
  );
}
