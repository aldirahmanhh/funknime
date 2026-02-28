import { NextResponse } from "next/server";
import { COMIC_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET() {
  const { res, json } = await upstreamGet(`${COMIC_BASE}/random`);
  return NextResponse.json(json, {
    status: res.status,
    headers: { "Cache-Control": cacheControlHeader({ sMaxage: 0, swr: 300 }) },
  });
}
