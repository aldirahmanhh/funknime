import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { getBaseUrl } from "@/lib/baseUrl";

async function getComic(id: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/comic/comic/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load comic detail");
  return res.json();
}

async function getChapters(id: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/comic/chapter/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load comic chapters");
  return res.json();
}

export default async function ComicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const detail = await getComic(id);
  // Upstream comic detail already includes chapters[] reliably.
  // The separate /comic/comic/chapter/{id} endpoint is inconsistent (may 403/502).
  const chapters = { data: detail?.chapters ?? [] };

  const session = await auth();
  const progress = session?.user?.email
    ? await prisma.comicProgress.findFirst({
        where: { user: { email: session.user.email }, comicId: id },
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{detail?.data?.title ?? id}</h1>

      {session?.user ? (
        <div className="mt-6 rounded-lg border bg-white p-4">
          <div className="text-sm font-semibold">Saved progress</div>
          <div className="mt-1 text-sm text-zinc-600">
            {progress?.chapterTitle ? `Last read: ${progress.chapterTitle}` : "No saved chapter yet."}
          </div>
          <form className="mt-3 flex gap-2" action={`/api/progress/comic`} method="post">
            <input type="hidden" name="comicId" value={id} />
            <input
              name="chapterTitle"
              placeholder="Chapter title"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Save</button>
          </form>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border bg-white p-4 text-sm">
          Sign in untuk menyimpan progress bacaan.
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Chapters</h2>
        <div className="mt-2 grid gap-2">
          {(chapters?.data ?? []).slice(0, 50).map((c: any, idx: number) => (
            <a
              key={c?.slug ?? c?.link ?? idx}
              href={`/comic/read/${encodeURIComponent(c?.slug ?? "")}?from=${encodeURIComponent(id)}`}
              className="block rounded-md border bg-white p-3 text-sm hover:shadow"
            >
              <div className="font-medium">{c?.chapter ?? "Chapter"}</div>
              <div className="text-xs text-zinc-500">{c?.date ?? ""}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
