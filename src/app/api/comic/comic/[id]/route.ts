import { NextRequest, NextResponse } from "next/server";
import { COMIC_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const comicId = decodeURIComponent(id);

  const { res, json } = await upstreamGet(`${COMIC_BASE}/comic/${encodeURIComponent(comicId)}`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      "Cache-Control": cacheControlHeader({ sMaxage: 600, swr: 86400 }),
    },
  });
}
