"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type HeroItem = {
  title: string;
  poster: string;
  animeId: string;
  episodes?: number;
  releaseDay?: string;
};

function pickRandom<T>(arr: T[], n: number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function HeroCarousel({ items }: { items: HeroItem[] }) {
  // Avoid hydration mismatch: pick a deterministic subset on first render.
  // Then randomize on client after mount.
  const baseList = useMemo(() => items.slice(0, Math.min(6, items.length)), [items]);
  const [list, setList] = useState<HeroItem[]>(baseList);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setList(pickRandom(items, Math.min(6, items.length)));
  }, [items]);

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => setIdx((v) => (v + 1) % list.length), 6000);
    return () => clearInterval(t);
  }, [list.length]);

  const hero = list[idx];

  if (!hero) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.poster}
          alt={hero.title}
          className="h-full w-full object-cover opacity-35 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
      </div>

      <div className="relative p-6 sm:p-10">
        <p className="text-xs uppercase tracking-widest text-zinc-300">Trending right now</p>
        <h1 className="font-display mt-2 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
          {hero.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-200">
          Ep {hero.episodes ?? "-"} • {hero.releaseDay ?? ""}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="gradient-btn rounded-md px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            href={`/anime/${encodeURIComponent(hero.animeId)}`}
          >
            View Details
          </Link>
          <Link className="rounded-md border border-border/60 bg-card/60 px-4 py-2 text-sm text-foreground hover:bg-card" href="/anime">
            Browse Anime
          </Link>
          <Link className="rounded-md border border-border/60 bg-card/60 px-4 py-2 text-sm text-foreground hover:bg-card" href="/comic">
            Browse Comic
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {list.map((it, i) => (
            <button
              key={it.animeId}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-2.5 w-2.5 rounded-full border border-white/30 ${i === idx ? "bg-white" : "bg-white/20"}`}
              aria-label={`Go to ${it.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
