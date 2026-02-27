import { NextResponse } from "next/server";
import { ANIME_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET() {
  const { res, json } = await upstreamGet(`${ANIME_BASE}/home`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      // Cache at CDN to reduce upstream hits (rate limit 70/min)
      "Cache-Control": cacheControlHeader({ sMaxage: 120, swr: 900 }),
    },
  });
}
