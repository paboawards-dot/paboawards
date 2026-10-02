import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/config";

const display = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const body = Outfit({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "PABO AWARDS — Prix de l’Art du Bounkani", template: "%s | PABO AWARDS" },
  description: "Vote pour ton artiste du Bounkani. La voix du public. Le talent du Bounkani. 100 FCFA = 1 vote.",
  applicationName: "PABO AWARDS",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "PABO AWARDS", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website", siteName: "PABO AWARDS", locale: "fr_FR",
    title: "PABO AWARDS — Prix de l’Art du Bounkani",
    description: "Vote pour ton artiste du Bounkani. La voix du public. Le talent du Bounkani.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#06040c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var c=navigator.connection||{};if(c.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=3))d.setAttribute('data-lite','1')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
