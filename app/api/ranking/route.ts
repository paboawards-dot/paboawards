import { NextResponse } from "next/server";
import { getCandidates } from "@/lib/data";

export const revalidate = 15;

export async function GET() {
  const list = await getCandidates();
  return NextResponse.json(
    list.map((c) => ({ id: c.id, category_id: c.category_id, votes_count: c.votes_count, rank: c.rank })),
    { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" } }
  );
}
