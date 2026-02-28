import Link from "next/link";
import { getBaseUrl } from "@/lib/baseUrl";

async function getUnlimited() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/unlimited`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load anime list");
  return res.json();
}

export default async function AnimePage() {
  const data = await getUnlimited();
  const groups = data?.data?.list ?? [];

  return (
    <div className="py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Browse Anime (A–Z)</h1>
          <p className="mt-1 text-sm text-zinc-400">Sumber: /anime/unlimited</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        {groups.map((g: any) => (
          <section key={g.startWith} className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold tracking-tight">{g.startWith}</h2>
              <div className="text-xs text-zinc-400">{g.animeList?.length ?? 0} anime</div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(g.animeList ?? []).slice(0, 24).map((a: any) => (
                <Link
                  key={a.animeId}
                  href={`/anime/${encodeURIComponent(a.animeId)}`}
                  className="rounded-lg border border-border/40 bg-black/10 px-3 py-2 text-sm text-zinc-100 hover:bg-black/20"
                >
                  <div className="line-clamp-1 font-medium">{a.title}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
