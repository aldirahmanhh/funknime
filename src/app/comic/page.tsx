import Link from "next/link";

import { getBaseUrl } from "@/lib/baseUrl";

async function getHomepage() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/comic/homepage`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load comic homepage");
  return res.json();
}

export default async function ComicPage() {
  const data = await getHomepage();
  // Filter out non-comic items (e.g. /plus) that break the detail route.
  const latest = (data?.latest ?? []).filter((c: any) => {
    const link = String(c?.link ?? "");
    return link.startsWith("/manga/");
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold">Comic — Latest</h1>
      <p className="mt-1 text-sm text-zinc-600">Source: sankavollerei.com/comic</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {latest.map((c: any) => (
          <Link
            key={c.link}
            href={`/comic/${encodeURIComponent(c.link.replace(/^\/manga\//, "").replace(/\/$/, ""))}`}
            className="rounded-lg border bg-white p-3 hover:shadow"
          >
            <div className="text-sm font-semibold line-clamp-2">{c.title}</div>
            <div className="mt-1 text-xs text-zinc-500">{c.chapter}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-lg border bg-white p-4">
        <h2 className="text-sm font-semibold">Search</h2>
        <form className="mt-2 flex gap-2" action="/comic/search" method="get">
          <input name="q" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="one-piece" />
          <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Search</button>
        </form>
      </div>
    </div>
  );
}
