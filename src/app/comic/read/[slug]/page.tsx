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

      <div className="mt-4 flex items-center justify-between rounded-md border bg-white p-3 text-sm">
        <Link
          className={`underline ${idx <= 0 ? "pointer-events-none text-zinc-300" : ""}`}
          href={`/comic/read/${encodeURIComponent(slug)}?page=${idx}&from=${encodeURIComponent(from ?? "")}`}
        >
          Prev
        </Link>
        <div>
          Page {idx + 1} / {images.length}
        </div>
        <Link
          className={`underline ${idx >= images.length - 1 ? "pointer-events-none text-zinc-300" : ""}`}
          href={`/comic/read/${encodeURIComponent(slug)}?page=${idx + 2}&from=${encodeURIComponent(from ?? "")}`}
        >
          Next
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border bg-black">
        {current ? (
          <div className="relative aspect-[3/4] w-full bg-black">
            {/* Use plain img to avoid remote image config for MVP */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current} alt={`Page ${idx + 1}`} className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="p-6 text-sm text-white">No image found.</div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        {nav?.previousChapter ? (
          <Link className="underline" href={`/comic/read/${encodeURIComponent(nav.previousChapter)}?page=1&from=${encodeURIComponent(from ?? "")}`}>
            Prev Chapter
          </Link>
        ) : (
          <span />
        )}
        {nav?.nextChapter ? (
          <Link className="underline" href={`/comic/read/${encodeURIComponent(nav.nextChapter)}?page=1&from=${encodeURIComponent(from ?? "")}`}>
            Next Chapter
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
