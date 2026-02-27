import { NextRequest, NextResponse } from "next/server";
import { ANIME_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const animeId = decodeURIComponent(id);

  const { res, json } = await upstreamGet(`${ANIME_BASE}/anime/${encodeURIComponent(animeId)}`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      // detail can be cached longer
      "Cache-Control": cacheControlHeader({ sMaxage: 600, swr: 86400 }),
    },
  });
}
