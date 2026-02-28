import Link from "next/link";

export function MediaCard({
  title,
  subtitle,
  image,
  href,
}: {
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-xl border border-border/60 bg-card/70 hover:bg-card"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || "https://placehold.co/600x800/18181b/f4f4f5?text=No+Poster"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <div className="line-clamp-2 text-sm font-semibold text-foreground">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
      </div>
    </Link>
  );
}
