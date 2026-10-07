import type { Media } from "@/types/media";
import type { RecommendationEvent, RecommendationPreferences, RecommendationResult, WatchPeriod } from "@/types/recommendations";

export const RECOMMENDATION_EVENTS_KEY = "4plex:recommendation-events";
export const RECOMMENDATION_PREFS_KEY = "4plex:recommendation-preferences";

export const GENRE_NAMES: Record<number, string> = {
  12: "Adventure", 14: "Fantasy", 16: "Animation", 18: "Drama", 27: "Horror", 28: "Action",
  35: "Comedy", 36: "History", 37: "Western", 53: "Thriller", 80: "Crime", 99: "Documentary",
  878: "Sci-Fi", 9648: "Mystery", 10749: "Romance", 10751: "Family", 10752: "War", 10759: "Action",
  10762: "Kids", 10763: "News", 10764: "Reality", 10765: "Sci-Fi", 10766: "Soap", 10767: "Talk",
  10768: "War", 10770: "TV Movie",
};

export const getPeriod = (date = new Date(), timezone = "Asia/Kolkata"): WatchPeriod => {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: timezone }).format(date));
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

export const readEvents = (): RecommendationEvent[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECOMMENDATION_EVENTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as RecommendationEvent[] : [];
  } catch { return []; }
};

export const readPreferences = (): RecommendationPreferences => {
  if (typeof window === "undefined") return { enabled: true, timezone: "Asia/Kolkata", favoriteGenreIds: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(RECOMMENDATION_PREFS_KEY) ?? "{}") as Partial<RecommendationPreferences>;
    return {
      enabled: parsed.enabled !== false,
      timezone: parsed.timezone || "Asia/Kolkata",
      favoriteGenreIds: Array.isArray(parsed.favoriteGenreIds) ? parsed.favoriteGenreIds : [],
    };
  } catch { return { enabled: true, timezone: "Asia/Kolkata", favoriteGenreIds: [] }; }
};

export const savePreferences = (preferences: RecommendationPreferences) => {
  localStorage.setItem(RECOMMENDATION_PREFS_KEY, JSON.stringify(preferences));
};

export const recordEvent = (event: Omit<RecommendationEvent, "id" | "watchedAt" | "timezone" | "period">) => {
  if (typeof window === "undefined") return;
  const preferences = readPreferences();
  const next: RecommendationEvent = {
    ...event,
    id: crypto.randomUUID(),
    watchedAt: new Date().toISOString(),
    timezone: preferences.timezone,
    period: getPeriod(new Date(), preferences.timezone),
  };
  const events = [next, ...readEvents()].slice(0, 500);
  localStorage.setItem(RECOMMENDATION_EVENTS_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event("4plex:recommendations-updated"));
};

export const scheduleRecordEvent = (event: Omit<RecommendationEvent, "id" | "watchedAt" | "timezone" | "period">) => {
  if (typeof window === "undefined") return;
  const run = () => recordEvent(event);
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 1000 });
  } else {
    setTimeout(run, 0);
  }
};

const recencyWeight = (watchedAt: string) => Math.exp(-Math.max(0, Date.now() - Date.parse(watchedAt)) / (1000 * 60 * 60 * 24 * 45));
const mediaKey = (media: Pick<Media, "type" | "id">) => `${media.type}-${media.id}`;

export const uniqueMedia = (items: Media[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = mediaKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const genreProfile = (events: RecommendationEvent[], period?: WatchPeriod) => {
  const scores: Record<number, number> = {};
  const watchCounts = new Map<number, number>();
  for (const event of events) {
    if (event.contentId && event.type.startsWith("watch")) {
      watchCounts.set(event.contentId, (watchCounts.get(event.contentId) ?? 0) + 1);
    }
  }
  for (const event of events) {
    if (period && event.period !== period) continue;
    const completion = event.completionPercentage ?? (event.type === "watch_complete" ? 100 : event.type === "watch_start" ? 15 : 5);
    const typeWeight = event.type === "watch_complete" ? 2.2 : event.type === "watch_progress" ? 1.5 : event.type === "open" ? 0.15 : event.type === "list_add" ? 0.7 : event.type === "like" ? 1.8 : 1;
    const rewatchBoost = (event.contentId ? watchCounts.get(event.contentId) ?? 0 : 0) > 1 ? 1.35 : 1;
    for (const genreId of event.genreIds ?? []) scores[genreId] = (scores[genreId] ?? 0) + typeWeight * (completion / 100) * recencyWeight(event.watchedAt) * rewatchBoost;
  }
  const max = Math.max(...Object.values(scores), 1);
  return Object.fromEntries(Object.entries(scores).map(([id, value]) => [id, Math.round((value / max) * 100)]));
};

export const scoreRecommendations = (candidates: Media[], events: RecommendationEvent[], preferences: RecommendationPreferences, now = new Date()): RecommendationResult[] => {
  if (!preferences.enabled) return [];
  const period = getPeriod(now, preferences.timezone);
  const global = genreProfile(events);
  const timed = genreProfile(events, period);
  const recentIds = new Set(events.filter((event) => event.contentId && Date.now() - Date.parse(event.watchedAt) < 1000 * 60 * 60 * 24 * 14).map((event) => `${event.contentType}-${event.contentId}`));
  const ranked = uniqueMedia(candidates)
    .filter((candidate) => !recentIds.has(mediaKey(candidate)))
    .map((candidate) => {
      const genreScores = candidate.genreIds.map((id) => ({ timed: timed[id] ?? 0, global: global[id] ?? 0 }));
      const timedScore = genreScores.reduce((sum, score) => sum + score.timed, 0) / Math.max(genreScores.length, 1);
      const globalScore = genreScores.reduce((sum, score) => sum + score.global, 0) / Math.max(genreScores.length, 1);
      const favoriteScore = candidate.genreIds.some((id) => preferences.favoriteGenreIds.includes(id)) ? 25 : 0;
      return { candidate, score: timedScore * 0.5 + globalScore * 0.25 + favoriteScore + candidate.rating * 2 };
    }).sort((a, b) => b.score - a.score);
  const topGenre = Object.entries(timed).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const genre = topGenre ? GENRE_NAMES[Number(topGenre[0])] ?? "favorites" : "favorites";
  const periodNames = { morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Late-Night" };
  const first = ranked.slice(0, 7).map(({ candidate }) => candidate);
  if (!first.length) return [];
  const firstKeys = new Set(first.map(mediaKey));
  const second = ranked
    .map(({ candidate }) => candidate)
    .filter((candidate) => !firstKeys.has(mediaKey(candidate)))
    .slice(0, 7);
  return [
    { title: topGenre ? `Your ${periodNames[period]} ${genre} Picks` : `Perfect for Your ${periodNames[period]}`, reason: topGenre ? `You often watch ${genre.toLowerCase()} around this time.` : "Popular, highly rated picks for your current watch window.", items: first },
    ...(second.length ? [{ title: "Because You Watch These", reason: "Matched with your recent viewing patterns.", items: second }] : []),
  ];
};
