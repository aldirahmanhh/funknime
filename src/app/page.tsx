import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Anime & Comic</h1>
          <nav className="flex gap-3 text-sm">
            <Link className="underline" href="/anime">Anime</Link>
            <Link className="underline" href="/comic">Comic</Link>
          </nav>
        </header>

        <main className="mt-10 grid gap-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">MVP</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Data dari Sanka API, tapi semua request lewat proxy internal supaya aman dari rate limit 70 req/menit.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="rounded-md bg-black px-4 py-2 text-sm text-white" href="/anime">
                Browse Anime
              </Link>
              <Link className="rounded-md border border-zinc-200 px-4 py-2 text-sm" href="/comic">
                Browse Comic
              </Link>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold">API Proxy endpoints</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
              <li>/api/anime/home</li>
              <li>/api/anime/search/&lt;query&gt;</li>
              <li>/api/anime/anime/&lt;id&gt;</li>
              <li>/api/comic/homepage</li>
              <li>/api/comic/search?q=one-piece</li>
              <li>/api/comic/comic/&lt;id&gt;</li>
              <li>/api/comic/chapter/&lt;id&gt;</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
