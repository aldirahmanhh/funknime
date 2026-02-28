import { NextRequest, NextResponse } from "next/server";
import { COMIC_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const genreId = decodeURIComponent(id);

  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "1";

  const { res, json } = await upstreamGet(
    `${COMIC_BASE}/genre/${encodeURIComponent(genreId)}?page=${encodeURIComponent(page)}`
  );

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      "Cache-Control": cacheControlHeader({ sMaxage: 300, swr: 1800 }),
    },
  });
}
