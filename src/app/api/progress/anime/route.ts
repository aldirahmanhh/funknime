import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const animeId = String(form.get("animeId") ?? "").trim();
  const episodeEpsRaw = String(form.get("episodeEps") ?? "").trim();

  const episodeEps = episodeEpsRaw ? Number(episodeEpsRaw) : null;

  if (!animeId) return NextResponse.json({ error: "animeId required" }, { status: 400 });
  if (episodeEpsRaw && (Number.isNaN(episodeEps) || episodeEps! <= 0)) {
    return NextResponse.json({ error: "episodeEps must be a positive number" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.animeProgress.upsert({
    where: { userId_animeId: { userId: user.id, animeId } },
    create: {
      userId: user.id,
      animeId,
      episodeEps: episodeEps ?? undefined,
    },
    update: {
      episodeEps: episodeEps ?? undefined,
      watchedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL(`/anime/${encodeURIComponent(animeId)}`, req.url), 303);
}
