import Link from "next/link";

export function ComicCard({
  title,
  image,
  chapter,
  href,
}: {
  title: string;
  image?: string;
  chapter?: string;
  href: string;
}) {
  return (
    <Link href={href} className="group min-w-[160px] overflow-hidden rounded-xl border border-border/60 bg-card/70 hover:bg-card sm:min-w-0">
      <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || "https://placehold.co/600x800/18181b/f4f4f5?text=Comic"}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <div className="line-clamp-2 text-sm font-semibold text-foreground">{title}</div>
        {chapter ? <div className="mt-1 text-xs text-muted-foreground">{chapter}</div> : null}
      </div>
    </Link>
  );
}
