import { NextRequest, NextResponse } from "next/server";
import { COMIC_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const chapterSlug = decodeURIComponent(slug);

  const { res, json } = await upstreamGet(`${COMIC_BASE}/chapter/${encodeURIComponent(chapterSlug)}`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      "Cache-Control": cacheControlHeader({ sMaxage: 600, swr: 86400 }),
    },
  });
}
