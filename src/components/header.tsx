import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/auth";

export default async function Header() {
  const session = await auth();

  return (
    <div className="sticky top-0 z-50 border-b border-zinc-800/60 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold tracking-tight text-white">
            funknime
          </Link>
          <nav className="hidden items-center gap-3 text-sm text-zinc-300 sm:flex">
            <Link className="hover:text-white" href="/anime">
              Anime
            </Link>
            <Link className="hover:text-white" href="/comic">
              Comic
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user ? (
            <form action="/api/auth/signout" method="post">
              <button className="rounded-md border border-zinc-700/60 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-900">
                Sign out
              </button>
            </form>
          ) : (
            <form action="/api/auth/signin" method="post">
              <button className="rounded-md border border-zinc-700/60 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-900">
                Sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
