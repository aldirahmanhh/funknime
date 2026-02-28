import { getBaseUrl } from "@/lib/baseUrl";
import { MediaCard } from "@/components/media-card";

async function searchAnime(q: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/search/${encodeURIComponent(q)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to search anime");
  return res.json();
}

export default async function AnimeSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = String(q).trim();

  const data = query ? await searchAnime(query) : null;
  const list = data?.data?.animeList ?? data?.data?.animeList?.animeList ?? data?.data?.animeList ?? [];
  const items = data?.data?.animeList ?? data?.data?.animeList?.animeList;

  // API format from sankavollerei: { data: { animeList: [ ... ] } }
  const animeList = Array.isArray(data?.data?.animeList)
    ? data.data.animeList
    : Array.isArray(data?.data?.animeList?.animeList)
      ? data.data.animeList.animeList
      : [];

  return (
    <div className="py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Search Anime</h1>
        <p className="mt-1 text-sm text-zinc-400">Cari anime via API search</p>
      </div>

      <form className="mt-4 flex gap-2" action="/anime/search" method="get">
        <input
          name="q"
          defaultValue={query}
          className="w-full rounded-md border border-border/60 bg-black/20 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
          placeholder="boruto"
        />
        <button className="gradient-btn rounded-md px-4 py-2 text-sm font-semibold text-black hover:opacity-90">
          Search
        </button>
      </form>

      {!query ? (
        <p className="mt-6 text-sm text-zinc-400">Masukkan query untuk mencari anime.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {animeList.map((a: any) => (
            <MediaCard
              key={a.animeId}
              title={a.title}
              subtitle={a.status ?? a.type ?? ""}
              image={a.poster}
              href={`/anime/${encodeURIComponent(a.animeId)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
