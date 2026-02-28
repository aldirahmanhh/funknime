import { NextResponse } from "next/server";
import { COMIC_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

export async function GET() {
  const { res, json } = await upstreamGet(`${COMIC_BASE}/trending`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      // fluctuates; still cache a bit to reduce upstream load
      "Cache-Control": cacheControlHeader({ sMaxage: 120, swr: 900 }),
    },
  });
}
