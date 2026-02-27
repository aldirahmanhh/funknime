import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { getBaseUrl } from "@/lib/baseUrl";

async function getDetail(id: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/anime/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load anime detail");
  return res.json();
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getDetail(id);
  const d = data?.data;

  const session = await auth();
  const progress = session?.user?.email
    ? await prisma.animeProgress.findFirst({
        where: { user: { email: session.user.email }, animeId: id },
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{d?.title ?? id}</h1>
      <div className="mt-2 text-sm text-zinc-600">Score: {d?.score ?? "-"} • Episodes: {d?.episodes ?? "-"}</div>
      <div className="mt-4 text-sm leading-6 text-zinc-800 whitespace-pre-line">
        {typeof d?.synopsis === "string"
          ? d.synopsis
          : Array.isArray(d?.synopsis?.paragraphs)
            ? d.synopsis.paragraphs.join("\n\n")
            : ""}
      </div>

      {session?.user ? (
        <div className="mt-6 rounded-lg border bg-white p-4">
          <div className="text-sm font-semibold">Saved progress</div>
          <div className="mt-1 text-sm text-zinc-600">
            {progress?.episodeEps ? `Last watched: Episode ${progress.episodeEps}` : "No saved episode yet."}
          </div>

          <form className="mt-3 flex gap-2" action={`/api/progress/anime`} method="post">
            <input type="hidden" name="animeId" value={id} />
            <input
              name="episodeEps"
              placeholder="Episode number (e.g. 3)"
              className="w-48 rounded-md border px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Save</button>
          </form>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border bg-white p-4 text-sm">
          Sign in untuk menyimpan progress episode.
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Episodes</h2>
        <div className="mt-2 grid gap-2">
          {(d?.episodeList ?? []).slice(0, 50).map((e: any) => (
            <a
              key={e.episodeId}
              href={`/anime/episode/${encodeURIComponent(e.episodeId)}`}
              className="block rounded-md border bg-white p-3 text-sm hover:shadow"
            >
              <div className="font-medium">{e.title}</div>
              <div className="text-xs text-zinc-500">Eps {e.eps} • {e.date}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
