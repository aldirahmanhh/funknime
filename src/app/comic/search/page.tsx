import Link from "next/link";

import { getBaseUrl } from "@/lib/baseUrl";

async function searchComics(q: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/comic/search?q=${encodeURIComponent(q)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to search comics");
  return res.json();
}

export default async function ComicSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = String(q).trim();

  const data = query ? await searchComics(query) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold">Comic Search</h1>

      <form className="mt-4 flex gap-2" action="/comic/search" method="get">
        <input
          name="q"
          defaultValue={query}
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="one-piece"
        />
        <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Search</button>
      </form>

      {!query ? (
        <p className="mt-6 text-sm text-zinc-600">Masukkan query untuk mencari komik.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(data?.data ?? []).map((c: any) => (
            <Link
              key={c.slug}
              href={`/comic/${encodeURIComponent(c.slug)}`}
              className="rounded-lg border bg-white p-3 hover:shadow"
            >
              <div className="text-sm font-semibold line-clamp-2">{c.title}</div>
              <div className="mt-1 text-xs text-zinc-500">{c.source}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
