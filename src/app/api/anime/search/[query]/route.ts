import { NextRequest, NextResponse } from "next/server";
import { ANIME_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ query: string }> }) {
  const { query } = await ctx.params;
  const q = decodeURIComponent(query);

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { error: "Query too short" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { res, json } = await upstreamGet(`${ANIME_BASE}/search/${encodeURIComponent(q)}`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      "Cache-Control": cacheControlHeader({ sMaxage: 60, swr: 600 }),
    },
  });
}
