import Link from "next/link";
import { getBaseUrl } from "@/lib/baseUrl";

async function getChapter(slug: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/comic/chapter/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load chapter");
  return res.json();
}

export default async function ComicReadPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; from?: string }>;
}) {
  const { slug } = await params;
  const { page = "1", from } = await searchParams;
  const chapter = await getChapter(slug);

  const images: string[] = chapter?.images ?? chapter?.data?.images ?? [];
  const nav = chapter?.navigation ?? chapter?.data?.navigation;

  const idx = Math.max(0, Math.min(images.length - 1, Number(page) - 1));
  const current = images[idx];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">{chapter?.manga_title ?? "Comic"}</h1>
          <p className="text-sm text-zinc-600">{chapter?.chapter_title ?? slug}</p>
        </div>
        {from ? (
          <Link className="underline text-sm" href={`/comic/${encodeURIComponent(from)}`}>
            Back
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-md border border-border/60 bg-card/40 p-3 text-sm">
        {from ? (
          <Link className="underline text-zinc-200" href={`/comic/${encodeURIComponent(from)}`}>
            Back
          </Link>
        ) : (
          <span />
        )}
        <div className="text-zinc-300">{chapter?.chapter_title ?? slug}</div>
        <div className="text-zinc-400">{images.length} pages</div>
      </div>

      <div className="mt-4 grid gap-3">
        {images.map((src, i) => (
          <div key={src} className="overflow-hidden rounded-lg border border-border/60 bg-card/60">
            <div className="relative w-full bg-card/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Page ${i + 1}`}
                className="h-auto w-full object-contain"
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={i < 2 ? "high" : "auto"}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        {nav?.previousChapter ? (
          <Link
            className="rounded-md border border-border/60 bg-card/60 px-3 py-2 text-foreground hover:bg-card"
            href={`/comic/read/${encodeURIComponent(nav.previousChapter)}?from=${encodeURIComponent(from ?? "")}`}
          >
            Prev Chapter
          </Link>
        ) : (
          <span />
        )}
        {nav?.nextChapter ? (
          <Link
            className="rounded-md bg-orange-500 px-3 py-2 font-semibold text-black hover:bg-orange-400"
            href={`/comic/read/${encodeURIComponent(nav.nextChapter)}?from=${encodeURIComponent(from ?? "")}`}
          >
            Next Chapter
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
