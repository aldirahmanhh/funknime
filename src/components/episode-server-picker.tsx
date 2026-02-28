"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type QualityOption = {
  title: string;
  servers: { title: string; serverId: string }[];
};

export function EpisodeServerPicker({ qualities }: { qualities: QualityOption[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const q = Number(sp.get("q") ?? "0");
  const s = Number(sp.get("s") ?? "0");

  const qIdx = Number.isFinite(q) ? q : 0;
  const sIdx = Number.isFinite(s) ? s : 0;

  const set = (nextQ: number, nextS: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("q", String(nextQ));
    params.set("s", String(nextS));
    router.replace(`?${params.toString()}`);
  };

  const servers = qualities[qIdx]?.servers ?? qualities[0]?.servers ?? [];

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      <div className="rounded-md border border-border/60 bg-black/20 px-3 py-2">
        <label className="mr-2 text-xs text-zinc-400">Quality</label>
        <select
          className="bg-transparent text-zinc-100 outline-none"
          value={Math.min(Math.max(0, qIdx), Math.max(0, qualities.length - 1))}
          onChange={(e) => set(Number(e.target.value), 0)}
        >
          {qualities.map((qq, i) => (
            <option key={qq.title + i} value={i}>
              {qq.title}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border border-border/60 bg-black/20 px-3 py-2">
        <label className="mr-2 text-xs text-zinc-400">Server</label>
        <select
          className="bg-transparent text-zinc-100 outline-none"
          value={Math.min(Math.max(0, sIdx), Math.max(0, servers.length - 1))}
          onChange={(e) => set(qIdx, Number(e.target.value))}
        >
          {servers.map((ss, i) => (
            <option key={ss.serverId} value={i}>
              {ss.title}
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-zinc-400">
        Tips: kalau server A banyak iklan, ganti ke filedon/mega.
      </div>
    </div>
  );
}
