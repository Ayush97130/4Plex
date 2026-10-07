import "server-only";

export interface PlaybackSource {
  url: string;
  kind: "embed" | "hls" | "mp4";
  subtitles: { label: string; lang: string; url: string }[];
}

export interface PlaybackRequest {
  type: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
}

export const nexstreamService = {
  async getPlayback(req: PlaybackRequest): Promise<PlaybackSource> {
    const key = process.env.NEXSTREAM_API_KEY;
    const base = process.env.NEXSTREAM_BASE_URL;
    if (!key || !base) throw new Error("Nexstream is not configured");

    const origin = base.endsWith("/") ? base.slice(0, -1) : base;
    const path = req.type === "movie"
      ? `/api/movie/${req.tmdbId}`
      : `/api/tv/${req.tmdbId}/${req.season ?? 1}/${req.episode ?? 1}`;
    const url = new URL(`${origin}${path}`);
    url.searchParams.set("apikey", key);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`Nexstream ${response.status}`);

      const data: unknown = await response.json();
      if (!isSourceResponse(data) || data.sources.length === 0) {
        throw new Error("Nexstream returned no playback sources");
      }

      const source = data.sources.find((item) => {
        try {
          const sourceUrl = new URL(item.url);
          return sourceUrl.protocol === "https:" || sourceUrl.protocol === "http:";
        } catch {
          return false;
        }
      });
      if (!source) throw new Error("Nexstream returned no valid playback source");

      return { url: source.url, kind: "embed", subtitles: [] };
    } finally {
      clearTimeout(timeout);
    }
  },
};

function isSourceResponse(value: unknown): value is { sources: { url: string }[] } {
  if (!value || typeof value !== "object" || !("sources" in value)) return false;
  const sources = value.sources;
  return Array.isArray(sources)
    && sources.every((source) => typeof source === "object"
      && source !== null
      && "url" in source
      && typeof source.url === "string");
}
