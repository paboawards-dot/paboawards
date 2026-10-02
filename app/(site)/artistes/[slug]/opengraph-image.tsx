import { ImageResponse } from "next/og";
import { getCandidateBySlug, getCategories } from "@/lib/data";
import { fetchDataUrl } from "@/lib/img";
import { initials } from "@/lib/format";

export const runtime = "nodejs";
export const revalidate = 300;
export const alt = "PABO AWARDS — Vote pour ton artiste";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { slug: string } }) {
  const cand = await getCandidateBySlug(params.slug);
  const cats = await getCategories();
  const cat = cats.find((c) => c.id === cand?.category_id);
  const photo = await fetchDataUrl(cand?.photo_url);
  const accent = cat?.color || "#ffc94a";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(120deg,#12082b 0%,#3b1a8a 50%,#ff5a3c 120%)", color: "#fff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", width: 520, height: 630, alignItems: "center", justifyContent: "center", background: "#1b1040", borderRight: `10px solid ${accent}` }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} width={520} height={630} style={{ objectFit: "cover", width: 520, height: 630 }} alt="" />
          ) : (
            <div style={{ display: "flex", fontSize: 200, fontWeight: 700, color: "#ffc94a" }}>{initials(cand?.name || "PABO")}</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#ffc94a" }}>VOTE POUR</div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.02, marginTop: 10 }}>{cand?.name || "Ton artiste"}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#ffffffd9", marginTop: 16 }}>{cat?.name || "Prix de l’Art du Bounkani"}</div>
          <div style={{ display: "flex", marginTop: 40, alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 54, fontWeight: 700, color: "#ffc94a", letterSpacing: 3 }}>PABO AWARDS</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#ffffffcc", marginTop: 6 }}>100 FCFA = 1 vote</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
