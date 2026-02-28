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
        className="rounded-md border border-border/60 bg-card/60 px-3 py-1 text-xs text-foreground"
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
      className="rounded-md border border-border/60 bg-card/60 px-3 py-1 text-xs text-foreground hover:bg-card"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
