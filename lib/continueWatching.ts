import type { MediaType } from "@/types/media";
import type { RecommendationEvent } from "@/types/recommendations";

export const CONTINUE_WATCHING_UPDATED = "4plex:continue-watching-updated";

export interface ContinueWatchingEntry {
  key: string;
  contentId: number;
  contentType: MediaType;
  title: string;
  poster: string | null;
  backdrop: string | null;
  progress: number;
  durationSeconds: number;
  watchedAt: string;
  season?: number;
  episode?: number;
  resumeUrl: string;
}

const eventKey = (event: Pick<RecommendationEvent, "contentType" | "contentId" | "season" | "episode">) =>
  `${event.contentType}-${event.contentId}-${event.season ?? 0}-${event.episode ?? 0}`;

export const getContinueWatching = (events: RecommendationEvent[]): ContinueWatchingEntry[] => {
  const latest = new Map<string, ContinueWatchingEntry>();
  for (const event of events) {
    if (!event.contentId || !event.contentType) continue;
    const key = eventKey(event);
    if (event.type === "watch_complete" || event.completed || (event.type === "watch_progress" && (event.completionPercentage ?? 0) >= 98)) {
      latest.delete(key);
      continue;
    }
    if (event.type !== "watch_progress") continue;
    const progress = Math.max(0, Math.min(100, Math.round(event.completionPercentage ?? 0)));
    if (progress <= 0 || progress >= 98) continue;
    if (latest.has(key)) continue;
    const params = new URLSearchParams();
    if (event.contentType === "tv") {
      params.set("s", String(event.season ?? 1));
      params.set("e", String(event.episode ?? 1));
    }
    latest.set(key, {
      key,
      contentId: event.contentId,
      contentType: event.contentType,
      title: event.title || "Untitled",
      poster: event.poster ?? null,
      backdrop: event.backdrop ?? null,
      progress,
      durationSeconds: event.durationSeconds ?? 0,
      watchedAt: event.watchedAt,
      season: event.season,
      episode: event.episode,
      resumeUrl: `/watch/${event.contentType}/${event.contentId}${params.toString() ? `?${params}` : ""}`,
    });
  }
  return [...latest.values()].sort((a, b) => Date.parse(b.watchedAt) - Date.parse(a.watchedAt));
};

export const continueWatchingFromEvents = (events: RecommendationEvent[]) => getContinueWatching(events);
