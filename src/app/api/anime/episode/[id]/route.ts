import { NextRequest, NextResponse } from "next/server";
import { ANIME_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const episodeId = decodeURIComponent(id);

  const { res, json } = await upstreamGet(`${ANIME_BASE}/episode/${encodeURIComponent(episodeId)}`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      // episodes change rarely; cache a bit longer
      "Cache-Control": cacheControlHeader({ sMaxage: 300, swr: 86400 }),
    },
  });
}
