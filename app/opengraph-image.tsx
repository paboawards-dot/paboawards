import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "PABO AWARDS — Prix de l’Art du Bounkani";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#12082b 0%,#3b1a8a 45%,#2f6bff 75%,#ff5a3c 110%)", color: "#fff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 40, letterSpacing: 10, color: "#ffffffcc" }}>ESPRIT GUERRIER PRÉSENTE</div>
        <div style={{ display: "flex", fontSize: 190, fontWeight: 700, color: "#ffc94a", letterSpacing: 6, lineHeight: 1 }}>PABO AWARDS</div>
        <div style={{ display: "flex", fontSize: 38, letterSpacing: 8, marginTop: 8 }}>PRIX DE L’ART DU BOUNKANI</div>
        <div style={{ display: "flex", fontSize: 44, marginTop: 36, fontWeight: 700 }}>Vote pour ton artiste du Bounkani</div>
      </div>
    ),
    { ...size }
  );
}
