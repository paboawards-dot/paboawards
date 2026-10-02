import { NavShell } from "@/components/NavShell";
import { Footer } from "@/components/Footer";
import { ServiceWorker } from "@/components/ServiceWorker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavShell />
      <main id="contenu">{children}</main>
      <Footer />
      <ServiceWorker />
    </>
  );
}
