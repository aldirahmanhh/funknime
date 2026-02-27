import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Anime & Comic",
  description: "Anime & Comic browser powered by Sanka API",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <div className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">
              Anime & Comic
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link className="underline" href="/anime">
                Anime
              </Link>
              <Link className="underline" href="/comic">
                Comic
              </Link>
              <span className="text-zinc-400">|</span>
              {session?.user ? (
                <>
                  <span className="text-zinc-700">Hi, {session.user.name ?? session.user.email}</span>
                  <form action="/api/auth/signout" method="post">
                    <button className="rounded-md border px-3 py-1">Sign out</button>
                  </form>
                </>
              ) : (
                <form action="/api/auth/signin" method="post">
                  <button className="rounded-md border px-3 py-1">Sign in</button>
                </form>
              )}
            </div>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}
