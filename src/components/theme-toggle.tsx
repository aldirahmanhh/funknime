"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch: don't render theme-dependent text until mounted.
  if (!mounted) {
    return (
      <button
        className="rounded-md border border-zinc-700/60 bg-zinc-900 px-3 py-1 text-xs text-zinc-100"
        type="button"
        aria-label="Toggle theme"
      >
        Theme
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      className="rounded-md border border-zinc-700/60 bg-zinc-900 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-800"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
