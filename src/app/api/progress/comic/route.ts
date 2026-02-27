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
  const comicId = String(form.get("comicId") ?? "").trim();
  const chapterTitle = String(form.get("chapterTitle") ?? "").trim();

  if (!comicId) return NextResponse.json({ error: "comicId required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.comicProgress.upsert({
    where: { userId_comicId: { userId: user.id, comicId } },
    create: {
      userId: user.id,
      comicId,
      chapterTitle: chapterTitle || undefined,
    },
    update: {
      chapterTitle: chapterTitle || undefined,
      readAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL(`/comic/${encodeURIComponent(comicId)}`, req.url), 303);
}
