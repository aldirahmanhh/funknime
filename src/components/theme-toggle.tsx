"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      className="rounded-md border border-zinc-700/60 bg-zinc-900 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-800 dark:border-zinc-700/60 dark:bg-zinc-900 dark:text-zinc-100"
      onClick={() => setTheme(next)}
      type="button"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
