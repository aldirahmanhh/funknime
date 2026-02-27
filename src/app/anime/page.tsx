import Link from "next/link";

import { getBaseUrl } from "@/lib/baseUrl";

async function getHome() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/home`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load anime home");
  return res.json();
}

export default async function AnimePage() {
  const home = await getHome();
  const list = home?.data?.ongoing?.animeList ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold">Anime — Ongoing</h1>
      <p className="mt-1 text-sm text-zinc-600">Source: sankavollerei.com/anime</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((a: any) => (
          <Link
            key={a.animeId}
            href={`/anime/${encodeURIComponent(a.animeId)}`}
            className="rounded-lg border bg-white p-3 hover:shadow"
          >
            <div className="text-sm font-semibold line-clamp-2">{a.title}</div>
            <div className="mt-1 text-xs text-zinc-500">
              Ep {a.episodes} • {a.releaseDay}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
