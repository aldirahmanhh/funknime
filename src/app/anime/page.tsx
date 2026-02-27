import { getBaseUrl } from "@/lib/baseUrl";
import { MediaCard } from "@/components/media-card";

async function getHome() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/home`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load anime home");
  return res.json();
}

export default async function AnimePage() {
  const home = await getHome();
  const list = home?.data?.ongoing?.animeList ?? [];

  return (
    <div className="py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ongoing Anime</h1>
          <p className="mt-1 text-sm text-zinc-400">Updated from sankavollerei.com/anime</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((a: any) => (
          <MediaCard
            key={a.animeId}
            title={a.title}
            subtitle={`Ep ${a.episodes} • ${a.releaseDay}`}
            image={a.poster}
            href={`/anime/${encodeURIComponent(a.animeId)}`}
          />
        ))}
      </div>
    </div>
  );
}
