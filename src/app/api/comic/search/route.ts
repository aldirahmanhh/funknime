import { NextRequest, NextResponse } from "next/server";
import { COMIC_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query too short" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { res, json } = await upstreamGet(`${COMIC_BASE}/search?q=${encodeURIComponent(q)}`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      "Cache-Control": cacheControlHeader({ sMaxage: 60, swr: 600 }),
    },
  });
}
