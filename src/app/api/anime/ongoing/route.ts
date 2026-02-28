import { NextRequest, NextResponse } from "next/server";
import { ANIME_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") ?? "1";

  const { res, json } = await upstreamGet(`${ANIME_BASE}/ongoing-anime?page=${encodeURIComponent(page)}`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      "Cache-Control": cacheControlHeader({ sMaxage: 120, swr: 900 }),
    },
  });
}
