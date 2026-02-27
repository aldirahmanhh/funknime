import { NextResponse } from "next/server";
import { ANIME_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET() {
  const { res, json } = await upstreamGet(`${ANIME_BASE}/schedule`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      // schedule changes daily; cache moderately
      "Cache-Control": cacheControlHeader({ sMaxage: 600, swr: 86400 }),
    },
  });
}
