import type { PayMethod } from "@/lib/types";

/* Pour utiliser les logos officiels : remplacez simplement public/pay/orange.svg, mtn.svg, moov.svg, wave.svg. */
export function PayLogo({ id, size = 64, className = "" }: { id: PayMethod; size?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/pay/${id}.svg`} width={size} height={size} alt="" className={`rounded-2xl ${className}`} loading="lazy" />;
}
