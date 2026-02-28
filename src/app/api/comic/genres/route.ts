import { NextResponse } from "next/server";
import { COMIC_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

// Note: upstream endpoint is /comic/genres (plural)
export async function GET() {
  const { res, json } = await upstreamGet(`${COMIC_BASE}/genres`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      // genre list is fairly stable
      "Cache-Control": cacheControlHeader({ sMaxage: 3600, swr: 86400 }),
    },
  });
}
