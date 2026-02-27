import Image from "next/image";
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

      <div className="mt-4 flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950/40 p-3 text-sm">
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
          <div key={src} className="overflow-hidden rounded-lg border border-zinc-800 bg-black">
            <div className="relative w-full bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Page ${i + 1}`} className="h-auto w-full object-contain" loading={i < 3 ? "eager" : "lazy"} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        {nav?.previousChapter ? (
          <Link
            className="rounded-md border border-zinc-800 px-3 py-2 text-zinc-100 hover:bg-zinc-900"
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
