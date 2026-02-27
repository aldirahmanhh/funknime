import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "funknime",
  description: "Anime & Comic browser powered by Sanka API",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <ThemeProvider>
          <Header />
          <div className="mx-auto max-w-6xl px-4">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
