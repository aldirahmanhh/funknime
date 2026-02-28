import { NextRequest, NextResponse } from "next/server";
import { COMIC_BASE, cacheControlHeader, upstreamGet } from "@/lib/sanka";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["manga", "manhwa", "manhua"]);

export async function GET(_req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  const t = decodeURIComponent(type).toLowerCase();

  if (!ALLOWED_TYPES.has(t)) {
    return NextResponse.json(
      { error: 'Invalid type. Use "manga", "manhwa", or "manhua"' },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { res, json } = await upstreamGet(`${COMIC_BASE}/type/${encodeURIComponent(t)}`);

  return NextResponse.json(json, {
    status: res.status,
    headers: {
      "Cache-Control": cacheControlHeader({ sMaxage: 600, swr: 3600 }),
    },
  });
}
