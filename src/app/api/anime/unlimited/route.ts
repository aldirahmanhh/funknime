import { NextResponse } from "next/server";
import { ANIME_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET() {
  const { res, json } = await upstreamGet(`${ANIME_BASE}/unlimited`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      // huge list; cache longer
      "Cache-Control": cacheControlHeader({ sMaxage: 3600, swr: 86400 }),
    },
  });
}
