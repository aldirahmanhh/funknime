export const ANIME_BASE = process.env.SANKA_ANIME_BASE_URL ?? "https://www.sankavollerei.com/anime";
export const COMIC_BASE = process.env.SANKA_COMIC_BASE_URL ?? "https://www.sankavollerei.com/comic";

// Note:
// - Anime search endpoint uses path param: /anime/search/:query
// - Comic search endpoint uses query param: /comic/search?q=:query

export type FetchJsonOptions = {
  // cache TTL in seconds for CDN
  sMaxage?: number;
  swr?: number;
};

export function cacheControlHeader({ sMaxage = 60, swr = 300 }: FetchJsonOptions = {}) {
  return `public, s-maxage=${sMaxage}, stale-while-revalidate=${swr}`;
}

export async function upstreamGet(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { res, json };
}
