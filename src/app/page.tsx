import Link from "next/link";

export default function Home() {
  return (
    <div className="py-10">
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-950 to-zinc-900 p-6 shadow">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-zinc-400">Browse • Track • Watch</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              funknime
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Anime & Comic browser dengan proxy cache untuk hemat request (rate limit aman). Login untuk simpan
              progress episode/chapter.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400" href="/anime">
                Browse Anime
              </Link>
              <Link className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-900" href="/comic">
                Browse Comic
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-sm font-semibold text-zinc-200">Quick links</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link className="rounded-md border border-zinc-800 px-3 py-1 hover:bg-zinc-900" href="/anime">
              Ongoing Anime
            </Link>
            <Link className="rounded-md border border-zinc-800 px-3 py-1 hover:bg-zinc-900" href="/comic">
              Latest Comic
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
