import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAdmin } from "@/lib/admin-auth";
import { serviceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = serviceClient();
  if (!db) return NextResponse.json({ error: "service" }, { status: 503 });

  const fd = await req.formData();
  const file = fd.get("file");
  const folder = String(fd.get("folder") || "divers").replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "divers";
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Seules les images JPG, PNG ou WebP sont acceptées." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image trop lourde (5 Mo maximum)." }, { status: 400 });

  const path = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage.from("media").upload(path, buf, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data } = db.storage.from("media").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
