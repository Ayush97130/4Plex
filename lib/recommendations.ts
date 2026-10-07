import type { Media } from "@/types/media";
import type { RecommendationEvent, RecommendationPreferences, RecommendationResult, WatchPeriod } from "@/types/recommendations";

export const RECOMMENDATION_EVENTS_KEY = "4plex:recommendation-events";
export const RECOMMENDATION_PREFS_KEY = "4plex:recommendation-preferences";
export const MY_LIST_KEY = "4plex:list";

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

const recencyWeight = (watchedAt: string, now = Date.now()) => Math.exp(-Math.max(0, now - Date.parse(watchedAt)) / (1000 * 60 * 60 * 24 * 45));
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
  const nowMs = now.getTime();
  const period = getPeriod(now, preferences.timezone);
  const global = genreProfile(events);
  const timed = genreProfile(events, period);
  const watchedEvents = events.filter((event) => event.contentId && event.contentType && event.type.startsWith("watch"));
  const watchedIds = new Set(watchedEvents.map((event) => `${event.contentType}-${event.contentId}`));
  const recentEvents = watchedEvents.filter((event) => nowMs - Date.parse(event.watchedAt) < 1000 * 60 * 60 * 24 * 45);
  const recentGenres = new Set(recentEvents.flatMap((event) => event.genreIds ?? []));
  const listIds = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(MY_LIST_KEY) ?? "[]");
      if (Array.isArray(saved)) saved.forEach((item) => {
        if (item && typeof item === "object" && "id" in item && "type" in item) {
          listIds.add(`${String(item.type)}-${String(item.id)}`);
        }
      });
    } catch { /* Recommendations still work without local list data. */ }
  }
  const searchTerms = events.filter((event) => event.type === "search" && event.query).map((event) => event.query!.toLowerCase().trim()).filter(Boolean);
  const favoriteGenres = new Set(preferences.favoriteGenreIds);
  const ranked = uniqueMedia(candidates)
    .filter((candidate) => !watchedIds.has(mediaKey(candidate)))
    .map((candidate) => {
      const matchingGenres = candidate.genreIds.filter((id) => recentGenres.has(id)).length;
      const genreScore = Math.min(1, (candidate.genreIds.reduce((sum, id) => sum + (global[id] ?? 0), 0) / Math.max(candidate.genreIds.length, 1)) / 100);
      const recentScore = Math.min(1, matchingGenres / Math.max(candidate.genreIds.length, 1));
      const similarScore = candidate.genreIds.some((id) => recentGenres.has(id)) ? 1 : 0;
      const listScore = candidate.genreIds.some((id) => favoriteGenres.has(id)) || listIds.has(mediaKey(candidate)) ? 1 : 0;
      const searchScore = searchTerms.some((term) => candidate.title.toLowerCase().includes(term)) ? 1 : 0;
      const qualityScore = Math.min(1, Math.max(0, candidate.rating) / 10);
      const timedScore = candidate.genreIds.reduce((sum, id) => sum + (timed[id] ?? 0), 0) / Math.max(candidate.genreIds.length, 1) / 100;
      return {
        candidate,
        score: genreScore * 0.4 + (recentScore * 0.7 + timedScore * 0.3) * 0.25 + similarScore * 0.2 + listScore * 0.15 + searchScore * 0.1 + qualityScore * 0.05,
        recentScore,
        similarScore,
        listScore,
      };
    })
    .sort((a, b) => b.score - a.score);
  const diversify = (items: typeof ranked, limit = 7) => {
    const selected: typeof ranked = [];
    const seenGenres = new Set<number>();
    for (const item of items) {
      const freshGenre = item.candidate.genreIds.some((id) => !seenGenres.has(id));
      if (freshGenre || selected.length < 2) {
        selected.push(item);
        item.candidate.genreIds.forEach((id) => seenGenres.add(id));
      }
      if (selected.length === limit) break;
    }
    return selected.map(({ candidate }) => candidate);
  };
  const used = new Set<string>();
  const takeFresh = (items: typeof ranked) => diversify(items).filter((candidate) => {
    const key = mediaKey(candidate);
    if (used.has(key)) return false;
    used.add(key);
    return true;
  });
  const topGenre = Object.entries(timed).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const genre = topGenre ? GENRE_NAMES[Number(topGenre[0])] ?? "favorites" : "favorites";
  const periodNames = { morning: "Morning", afternoon: "Afternoon", evening: "Evening", night: "Late-Night" };
  const sections: RecommendationResult[] = [];
  const because = takeFresh(ranked.filter((item) => item.similarScore > 0));
  const favorites = takeFresh(ranked.filter((item) => item.listScore > 0));
  const recent = takeFresh(ranked.filter((item) => item.recentScore > 0));
  const general = takeFresh(ranked);
  if (because.length) sections.push({ title: "Because You Watched...", reason: "Titles that match the genres in your recent viewing.", items: because });
  if (favorites.length) sections.push({ title: "Based On Your Favorites", reason: "Picks shaped by your saved preferences and My List.", items: favorites });
  if (recent.length) sections.push({ title: "Recommended For You", reason: topGenre ? `More ${genre.toLowerCase()} picks for your watch habits.` : "Popular picks matched to your viewing activity.", items: recent });
  if (general.length && !sections.length) sections.push({ title: "Trending For You", reason: "Popular and highly rated titles while you build your profile.", items: general });
  return sections.slice(0, 3);
};
