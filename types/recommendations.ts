import type { Media, MediaType } from "@/types/media";

export type WatchPeriod = "morning" | "afternoon" | "evening" | "night";
export type RecommendationEventType = "open" | "watch_start" | "watch_progress" | "watch_complete" | "search" | "list_add" | "like";

export interface RecommendationEvent {
  id: string;
  type: RecommendationEventType;
  contentId?: number;
  contentType?: MediaType;
  genreIds?: number[];
  title?: string;
  query?: string;
  watchedAt: string;
  durationSeconds?: number;
  completionPercentage?: number;
  completed?: boolean;
  season?: number;
  episode?: number;
  poster?: string | null;
  backdrop?: string | null;
  timezone: string;
  period: WatchPeriod;
}

export interface RecommendationPreferences {
  enabled: boolean;
  timezone: string;
  favoriteGenreIds: number[];
}

export interface RecommendationResult {
  title: string;
  reason: string;
  items: Media[];
}
