import Link from "next/link";
import { getBaseUrl } from "@/lib/baseUrl";

async function getAnimeHome() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/home`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function Home() {
  const home = await getAnimeHome();
  const hero = home?.data?.ongoing?.animeList?.[0];

  return (
    <div className="py-8">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        {/* background */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero?.poster}
            alt={hero?.title ?? "hero"}
            className="h-full w-full object-cover opacity-35 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        </div>

        <div className="relative p-6 sm:p-10">
          <p className="text-xs uppercase tracking-widest text-zinc-300">Trending right now</p>
          <h1 className="font-display mt-2 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {hero?.title ?? "funknime"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-200">
            Streaming & baca komik. Semua request lewat proxy cache biar aman dari rate limit.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {hero?.animeId ? (
              <Link
                className="gradient-btn rounded-md px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
                href={`/anime/${encodeURIComponent(hero.animeId)}`}
              >
                View Details
              </Link>
            ) : null}
            <Link
              className="rounded-md border border-border/60 bg-black/20 px-4 py-2 text-sm text-zinc-100 hover:bg-black/30"
              href="/anime"
            >
              Browse Anime
            </Link>
            <Link
              className="rounded-md border border-border/60 bg-black/20 px-4 py-2 text-sm text-zinc-100 hover:bg-black/30"
              href="/comic"
            >
              Browse Comic
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 rounded-2xl border border-border/60 bg-card/40 p-6">
        <h2 className="text-sm font-semibold text-zinc-200">Quick links</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link className="rounded-md border border-border/60 bg-black/20 px-3 py-1 hover:bg-black/30" href="/anime">
            Ongoing Anime
          </Link>
          <Link className="rounded-md border border-border/60 bg-black/20 px-3 py-1 hover:bg-black/30" href="/comic">
            Latest Comic
          </Link>
        </div>
      </section>
    </div>
  );
}
