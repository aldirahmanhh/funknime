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

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => (
          <MediaCard key={it.href} title={it.title} subtitle={it.subtitle} image={it.image} href={it.href} />
        ))}
      </div>
    </section>
  );
}
