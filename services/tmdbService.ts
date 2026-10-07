import "server-only";
import type { Detail, Episode, Media, MediaType } from "@/types/media";

const BASE = "https://api.themoviedb.org/3";
export const img = (p: string | null, size = "w500") => (p ? `https://image.tmdb.org/t/p/${size}${p}` : null);

export class TmdbError extends Error {
  constructor(message: string, public readonly status?: number, public readonly retryAfterMs = 0) {
    super(message);
    this.name = "TmdbError";
  }
}

export class TmdbNotFoundError extends TmdbError {
  constructor(message: string) {
    super(message, 404);
    this.name = "TmdbNotFoundError";
  }
}

const retryableStatus = (status: number) => status === 429 || status >= 500;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRetryAfter(value: string | null) {
  if (!value) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : 0;
}

async function tmdb<T>(path: string, params: Record<string, string> = {}, revalidate = 3600): Promise<T> {
  const key = process.env.TMDB_API_KEY?.trim();
  if (!key) throw new Error("TMDB_API_KEY is not set");

  const url = new URL(BASE + path);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, value));
  const headers: HeadersInit = key.length > 40 ? { Authorization: `Bearer ${key}` } : {};
  if (key.length <= 40) url.searchParams.set("api_key", key);

  let lastError: TmdbError | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(url, { headers, next: { revalidate }, signal: controller.signal });
      if (response.ok) return await response.json() as T;

      const body = await response.text().catch(() => "");
      let message = body || response.statusText;
      try {
        const parsed = JSON.parse(body) as { status_message?: string };
        message = parsed.status_message || message;
      } catch {
        // TMDB may return a non-JSON error body.
      }

      const error = response.status === 404
        ? new TmdbNotFoundError(`TMDB 404: ${message}`)
        : new TmdbError(`TMDB ${response.status}: ${message}`, response.status, parseRetryAfter(response.headers.get("retry-after")));
      if (error.status === 404 || !retryableStatus(error.status ?? 0)) throw error;
      lastError = error;
    } catch (caught) {
      if (caught instanceof TmdbNotFoundError) throw caught;
      const error = caught instanceof TmdbError
        ? caught
        : new TmdbError(caught instanceof Error && caught.name === "AbortError" ? "TMDB request timed out after 8 seconds" : caught instanceof Error ? caught.message : "TMDB request failed");
      lastError = error;
      if (error.status && !retryableStatus(error.status)) throw error;
    } finally {
      clearTimeout(timeout);
    }
    if (attempt < 2) await wait(lastError?.retryAfterMs || 500 * 2 ** attempt);
  }

  console.error("[tmdb] request failed", { path, status: lastError?.status, message: lastError?.message });
  throw lastError ?? new TmdbError("TMDB request failed");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const toMedia = (value: any, fallback?: MediaType): Media => {
  const source = value && typeof value === "object" ? value : {};
  const type: MediaType = (source.media_type ?? fallback) === "tv" ? "tv" : "movie";
  const releaseDate = typeof source.release_date === "string" ? source.release_date : typeof source.first_air_date === "string" ? source.first_air_date : "";
  return {
    id: Number.isInteger(source.id) ? source.id : 0,
    type,
    title: source.title ?? source.name ?? "Untitled",
    overview: source.overview ?? "",
    poster: typeof source.poster_path === "string" ? source.poster_path : null,
    backdrop: typeof source.backdrop_path === "string" ? source.backdrop_path : null,
    year: releaseDate.slice(0, 4),
    rating: Math.round((Number(source.vote_average) || 0) * 10) / 10,
    genreIds: Array.isArray(source.genre_ids) ? source.genre_ids.filter((id: unknown): id is number => typeof id === "number") : [],
  };
};

const list = async (path: string, type?: MediaType, params: Record<string, string> = {}): Promise<Media[]> => {
  const data = await tmdb<any>(path, params);
  return (Array.isArray(data?.results) ? data.results : [])
    .filter((item: any) => item?.poster_path && item?.media_type !== "person")
    .map((item: any) => toMedia(item, type));
};

export const tmdbService = {
  trending: () => list("/trending/all/week"),
  popular: (type: MediaType) => list(`/${type}/popular`, type),
  topRated: (type: MediaType) => list(`/${type}/top_rated`, type),
  nowPlaying: () => list("/movie/now_playing", "movie"),
  byGenre: (type: MediaType, genreId: number) => list(`/discover/${type}`, type, { with_genres: String(genreId), sort_by: "popularity.desc" }),
  search: (query: string) => list("/search/multi", undefined, { query, include_adult: "false" }),

  async detail(type: MediaType, id: number): Promise<Detail> {
    const data = await tmdb<any>(`/${type}/${id}`, { append_to_response: "videos,credits,similar" });
    const [videosResult, creditsResult, similarResult] = await Promise.allSettled([
      Promise.resolve(data?.videos),
      Promise.resolve(data?.credits),
      Promise.resolve(data?.similar),
    ]);
    const videos = videosResult.status === "fulfilled" && videosResult.value ? videosResult.value : {};
    const credits = creditsResult.status === "fulfilled" && creditsResult.value ? creditsResult.value : {};
    const similar = similarResult.status === "fulfilled" && similarResult.value ? similarResult.value : {};
    const trailer = (Array.isArray(videos.results) ? videos.results : []).find((video: any) => video?.site === "YouTube" && video?.type === "Trailer");
    const minutes = Number(data?.runtime) || (Array.isArray(data?.episode_run_time) ? Number(data.episode_run_time[0]) : 0);

    return {
      ...toMedia(data, type),
      tagline: data?.tagline ?? "",
      runtime: minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`.replace(/^0h /, "") : "",
      genres: (Array.isArray(data?.genres) ? data.genres : []).map((genre: any) => genre?.name).filter((name: unknown): name is string => Boolean(name)),
      seasons: Number.isInteger(data?.number_of_seasons) ? data.number_of_seasons : undefined,
      cast: (Array.isArray(credits.cast) ? credits.cast : []).slice(0, 14).map((person: any) => ({
        id: Number(person?.id) || 0,
        name: person?.name ?? "Unknown",
        character: person?.character ?? "",
        photo: typeof person?.profile_path === "string" ? person.profile_path : null,
      })),
      trailerKey: typeof trailer?.key === "string" ? trailer.key : null,
      similar: (Array.isArray(similar.results) ? similar.results : [])
        .filter((item: any) => item?.poster_path)
        .slice(0, 14)
        .map((item: any) => toMedia(item, type)),
    };
  },
  async season(id: number, number: number): Promise<Episode[]> {
    const data = await tmdb<any>(`/tv/${id}/season/${number}`);
    return (Array.isArray(data?.episodes) ? data.episodes : []).map((episode: any) => ({
      id: Number(episode?.id) || 0,
      number: Number(episode?.episode_number) || 0,
      name: episode?.name ?? `Episode ${episode?.episode_number ?? ""}`,
      overview: episode?.overview ?? "",
      still: typeof episode?.still_path === "string" ? episode.still_path : null,
      runtime: Number.isFinite(Number(episode?.runtime)) ? Number(episode.runtime) : null,
    })).filter((episode: Episode) => episode.number > 0);
  },
};
