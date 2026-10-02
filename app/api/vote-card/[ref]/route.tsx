import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { serviceClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/config";
import { dateFr, fcfa, initials, num } from "@/lib/format";
import { fetchDataUrl } from "@/lib/img";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { ref: string } }) {
  const ref = params.ref;
  if (!/^PABO[A-Z0-9]{12}$/.test(ref)) return new Response("Not found", { status: 404 });
  const db = serviceClient();
  if (!db) return new Response("Service indisponible", { status: 503 });

  const { data: tx } = await db.from("transactions").select("ref,votes,amount,status,confirmed_at,candidate_id").eq("ref", ref).maybeSingle();
  if (!tx || tx.status !== "confirmed") return new Response("Not found", { status: 404 });
  const { data: cand } = await db.from("candidates").select("name,slug,photo_url,category_id").eq("id", tx.candidate_id).maybeSingle();
  if (!cand) return new Response("Not found", { status: 404 });
  const { data: cat } = await db.from("categories").select("name,color").eq("id", cand.category_id).maybeSingle();

  const link = `${siteUrl()}/artistes/${cand.slug}`;
  const [photo, qr] = await Promise.all([
    fetchDataUrl(cand.photo_url),
    QRCode.toDataURL(link, { margin: 1, width: 360, color: { dark: "#150b2e", light: "#ffffff" } }),
  ]);
  const accent = cat?.color || "#ff9a1f";
  const d = dateFr(tx.confirmed_at, true);

  const img = new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center",
          background: "linear-gradient(160deg,#12082b 0%,#3b1a8a 38%,#2f6bff 70%,#ff5a3c 100%)",
          padding: "54px 60px", color: "#fff", fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, color: "#ffc94a", letterSpacing: 4 }}>PABO AWARDS</div>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#ffffffcc", marginTop: -4 }}>PRIX DE L’ART DU BOUNKANI</div>
        </div>

        <div
          style={{
            display: "flex", marginTop: 34, width: 640, height: 640, borderRadius: 48, overflow: "hidden",
            border: `10px solid ${accent}`, background: "#1b1040", alignItems: "center", justifyContent: "center",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} width={640} height={640} style={{ objectFit: "cover", width: 640, height: 640 }} alt="" />
          ) : (
            <div style={{ display: "flex", fontSize: 220, fontWeight: 700, color: "#ffc94a" }}>{initials(cand.name)}</div>
          )}
        </div>

        <div style={{ display: "flex", marginTop: 26, fontSize: 28, letterSpacing: 6, color: "#ffc94a" }}>J’AI VOTÉ POUR</div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, textAlign: "center", lineHeight: 1.05, maxWidth: 940 }}>{cand.name}</div>
        <div style={{ display: "flex", fontSize: 26, color: "#ffffffd9", marginTop: 8, textAlign: "center", maxWidth: 900 }}>{cat?.name || ""}</div>

        <div style={{ display: "flex", marginTop: 26, width: "100%", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#ffffff1f", borderRadius: 30, padding: "14px 46px", marginRight: 22 }}>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#ffffffcc" }}>VOTES</div>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#ffc94a" }}>{num(tx.votes)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#ffffff1f", borderRadius: 30, padding: "14px 46px" }}>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#ffffffcc" }}>MONTANT</div>
            <div style={{ display: "flex", fontSize: 54, fontWeight: 700, marginTop: 14 }}>{fcfa(tx.amount)}</div>
          </div>
        </div>

        <div style={{ display: "flex", marginTop: "auto", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, color: "#ffffffcc" }}>{d}</div>
            <div style={{ display: "flex", fontSize: 24, color: "#ffffffcc", marginTop: 6 }}>N° {tx.ref}</div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#ffc94a", marginTop: 14 }}>Vote pour ton artiste du Bounkani !</div>
          </div>
          <div style={{ display: "flex", background: "#fff", borderRadius: 24, padding: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} width={180} height={180} alt="" />
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  );

  const headers = new Headers(img.headers);
  headers.set("Cache-Control", "public, max-age=3600");
  if (new URL(req.url).searchParams.get("download")) headers.set("Content-Disposition", `attachment; filename="PABO-AWARDS-vote-${tx.ref}.png"`);
  return new Response(img.body, { headers });
}
