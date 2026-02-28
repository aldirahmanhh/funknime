import Link from "next/link";
import { getBaseUrl } from "@/lib/baseUrl";
import { HomeSearch } from "@/components/home-search";
import { RowSection } from "@/components/row-section";

async function getAnimeHome() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/home`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getSchedule() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/schedule`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function Home() {
  const [home, schedule, unlimited] = await Promise.all([getAnimeHome(), getSchedule(), (async () => {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/anime/unlimited`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  })()]);
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

          <div className="mt-5">
            <HomeSearch />
          </div>

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
              className="rounded-md border border-border/60 bg-card/60 px-4 py-2 text-sm text-foreground hover:bg-card"
              href="/anime"
            >
              Browse Anime
            </Link>
            <Link
              className="rounded-md border border-border/60 bg-card/60 px-4 py-2 text-sm text-foreground hover:bg-card"
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
          <Link className="rounded-md border border-border/60 bg-card/60 px-3 py-1 hover:bg-card" href="/anime">
            Browse Anime (A–Z)
          </Link>
          <Link className="rounded-md border border-border/60 bg-card/60 px-3 py-1 hover:bg-card" href="/comic">
            Browse Comic
          </Link>
        </div>
      </section>

      <RowSection
        title="Ongoing"
        viewMoreHref="/anime"
        items={(home?.data?.ongoing?.animeList ?? []).slice(0, 12).map((a: any) => ({
          title: a.title,
          subtitle: `Ep ${a.episodes} • ${a.releaseDay}`,
          image: a.poster,
          href: `/anime/${encodeURIComponent(a.animeId)}`,
        }))}
      />

      <RowSection
        title="Completed"
        viewMoreHref="/anime"
        items={(home?.data?.completed?.animeList ?? []).slice(0, 12).map((a: any) => ({
          title: a.title,
          subtitle: `${a.episodes ?? "-"} eps • score ${a.score ?? "-"}`,
          image: a.poster,
          href: `/anime/${encodeURIComponent(a.animeId)}`,
        }))}
      />

      <RowSection
        title="Unlimited (A–Z)"
        viewMoreHref="/anime"
        items={(() => {
          const list = unlimited?.data?.list ?? [];
          const firstLetter = list.find((g: any) => g.startWith === "A") ?? list[0];
          const items = (firstLetter?.animeList ?? []).slice(0, 12);
          return items.map((a: any) => ({
            title: a.title,
            subtitle: firstLetter?.startWith ?? "",
            // unlimited endpoint doesn't provide posters; use a placeholder so cards don't look broken
            image: "https://placehold.co/600x800/18181b/f4f4f5?text=A-Z",
            href: `/anime/${encodeURIComponent(a.animeId)}`,
          }));
        })()}
      />

      <section className="mt-6 rounded-2xl border border-border/60 bg-card/40 p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Schedule</h2>
            <p className="mt-1 text-sm text-zinc-400">Rilis anime berdasarkan hari</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(schedule?.data ?? []).map((d: any) => (
            <div key={d.day} className="rounded-xl border border-border/60 bg-card/60 p-4">
              <div className="flex items-center justify-between">
                <div className="font-display font-semibold tracking-tight">{d.day}</div>
                <div className="text-xs text-zinc-400">{d.anime_list?.length ?? 0} anime</div>
              </div>
              <div className="mt-3 grid gap-2">
                {(d.anime_list ?? []).slice(0, 6).map((a: any) => (
                  <Link
                    key={a.slug}
                    href={`/anime/${encodeURIComponent(a.slug)}`}
                    className="group flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 p-2 hover:bg-card/60"
                  >
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-muted/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.poster} alt={a.title} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-sm text-zinc-100 group-hover:text-white">{a.title}</div>
                      <div className="text-xs text-zinc-500">{a.slug}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
