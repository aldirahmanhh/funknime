import { getBaseUrl } from "@/lib/baseUrl";
import { EpisodeServerPicker } from "@/components/episode-server-picker";

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

export default async function EpisodePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; s?: string }>;
}) {
  const { id } = await params;
  const { q = "0", s = "0" } = await searchParams;

  const qIdx = Math.max(0, Number(q) || 0);
  const sIdx = Math.max(0, Number(s) || 0);

  const ep = await getEpisode(id);
  const d = ep?.data;

  const qualities = (d?.server?.qualities ?? []).map((qq: any) => ({
    title: qq.title,
    servers: (qq.serverList ?? []).map((ss: any) => ({ title: ss.title, serverId: ss.serverId })),
  }));

  const serverId = qualities?.[qIdx]?.servers?.[sIdx]?.serverId ?? qualities?.[0]?.servers?.[0]?.serverId;
  const embed = serverId ? await getServerUrl(serverId) : null;
  const embedUrl = embed?.data?.url ?? d?.defaultStreamingUrl;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">{d?.title ?? id}</h1>
      <p className="mt-1 text-sm text-zinc-400">Embed player (best-effort) • Source: sankavollerei</p>

      <EpisodeServerPicker qualities={qualities} />

      {embedUrl ? (
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-card/60">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            // Reduce pop-under / redirect behavior from embed providers
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
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
