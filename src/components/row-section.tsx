import Link from "next/link";
import { MediaCard } from "@/components/media-card";

type Item = {
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
};

export function RowSection({
  title,
  viewMoreHref,
  items,
}: {
  title: string;
  viewMoreHref: string;
  items: Item[];
}) {
  return (
    <section className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <Link className="text-sm text-zinc-300 hover:text-white" href={viewMoreHref}>
          View more →
        </Link>
      </div>

      {/* Mobile: horizontal swipe row. Desktop: grid. */}
      <div className="mt-4 -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => (
          <div key={it.href} className="min-w-[160px] sm:min-w-0">
            <MediaCard title={it.title} subtitle={it.subtitle} image={it.image} href={it.href} />
          </div>
        ))}
      </div>
    </section>
  );
}
