import { getBaseUrl } from "@/lib/baseUrl";
import { MediaCard } from "@/components/media-card";

async function getHomepage() {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/comic/homepage`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load comic homepage");
  return res.json();
}

function normalizeComicLink(link: string) {
  // homepage.latest provides /manga/<slug>/ for comics, but also has /plus/ ads.
  if (!link.startsWith("/manga/")) return null;
  return link.replace(/^\/manga\//, "").replace(/\/$/, "");
}

export default async function ComicPage() {
  const data = await getHomepage();
  const latest = (data?.latest ?? [])
    .map((c: any) => {
      const slug = normalizeComicLink(String(c?.link ?? ""));
      if (!slug) return null;
      return {
        title: String(c?.title ?? slug),
        slug,
        image: String(c?.image ?? ""),
        chapter: String(c?.chapter ?? ""),
      };
    })
    .filter(Boolean);

  return (
    <div className="py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Latest Comic</h1>
          <p className="mt-1 text-sm text-zinc-400">Updated from sankavollerei.com/comic</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {latest.map((c: any) => (
          <MediaCard
            key={c.slug}
            title={c.title}
            subtitle={c.chapter}
            image={c.image ? `https://www.sankavollerei.com${c.image}` : undefined}
            href={`/comic/${encodeURIComponent(c.slug)}`}
          />
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
        <h2 className="text-sm font-semibold text-zinc-200">Search comic</h2>
        <form className="mt-3 flex gap-2" action="/comic/search" method="get">
          <input
            name="q"
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            placeholder="one-piece"
          />
          <button className="rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-black hover:bg-orange-400">
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
