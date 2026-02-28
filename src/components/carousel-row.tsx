import Link from "next/link";
import type { ReactNode } from "react";

export function CarouselRow({
  title,
  viewMoreHref,
  children,
}: {
  title: string;
  viewMoreHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        {viewMoreHref ? (
          <Link className="text-sm text-muted-foreground hover:text-foreground" href={viewMoreHref}>
            View more →
          </Link>
        ) : null}
      </div>

      <div className="mt-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {children}
      </div>
    </section>
  );
}
