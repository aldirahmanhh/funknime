import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/auth";

export default async function Header() {
  const session = await auth();

  return (
    <div className="sticky top-0 z-50 border-b border-border/60 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            <span className="gradient-text">funknime</span>
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
              <button className="rounded-md border border-border/60 bg-card/60 px-3 py-1 text-xs text-foreground hover:bg-card">
                Sign out
              </button>
            </form>
          ) : (
            <form action="/api/auth/signin" method="post">
              <button className="gradient-btn rounded-md px-3 py-1 text-xs font-semibold text-black hover:opacity-90">
                Sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
