"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Result = {
  type: "anime" | "comic";
  title: string;
  href: string;
  sub?: string;
};

export function HomeSearch() {
  const [q, setQ] = useState("");

  // MVP: simple quick links, not live API search yet.
  const suggestions: Result[] = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];

    const items: Result[] = [
      { type: "anime", title: `Search anime: ${q}`, href: `/anime/search?q=${encodeURIComponent(q)}` },
      { type: "comic", title: `Search comic: ${q}`, href: `/comic/search?q=${encodeURIComponent(q)}` },
    ];

    return items;
  }, [q]);

  return (
    <div className="w-full max-w-xl">
      <div className="glass flex items-center gap-2 rounded-xl px-3 py-2">
        <span className="text-xs text-zinc-300">Search</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="anime / comic..."
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>

      {suggestions.length ? (
        <div className="mt-2 overflow-hidden rounded-xl border border-border/60 bg-card/70">
          {suggestions.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-black/20"
            >
              <div className="min-w-0">
                <div className="line-clamp-1 text-foreground">{s.title}</div>
              </div>
              <span className={`rounded-full border border-border/60 bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-foreground`}>
                {s.type}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
