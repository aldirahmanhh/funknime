import { getBaseUrl } from "@/lib/baseUrl";

async function getEpisode(id: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/episode/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load episode");
  return res.json();
}

async function getServerUrl(serverId: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/anime/server/${encodeURIComponent(serverId)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load server");
  return res.json();
}

export default async function EpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ep = await getEpisode(id);
  const d = ep?.data;

  // pick first available serverId from first quality
  const serverId = d?.server?.qualities?.[0]?.serverList?.[0]?.serverId as string | undefined;
  const embed = serverId ? await getServerUrl(serverId) : null;
  const embedUrl = embed?.data?.url ?? d?.defaultStreamingUrl;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-xl font-semibold">{d?.title ?? id}</h1>
      <p className="mt-1 text-sm text-zinc-600">Embed player (best-effort) • Source: sankavollerei</p>

      {embedUrl ? (
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg border bg-black">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="autoplay; fullscreen"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border bg-white p-4 text-sm">
          Player tidak tersedia untuk episode ini.
        </div>
      )}

      <div className="mt-8 grid gap-2 text-sm">
        {d?.hasPrevEpisode ? <a className="underline" href={d?.prevEpisode?.href}>Prev</a> : null}
        {d?.hasNextEpisode ? <a className="underline" href={d?.nextEpisode?.href}>Next</a> : null}
      </div>
    </div>
  );
}
