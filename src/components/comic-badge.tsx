export function ComicBadge({ type }: { type: "anime" | "comic" }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-foreground">
      {type}
    </span>
  );
}
