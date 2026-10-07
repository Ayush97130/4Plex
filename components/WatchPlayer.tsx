"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { recordEvent } from "@/lib/recommendations";
import type { MediaType } from "@/types/media";

export default function WatchPlayer({ src, contentId, contentType, genreIds, title, nextEpisodeUrl }: { src: string; contentId: number; contentType: MediaType; genreIds: number[]; title: string; nextEpisodeUrl?: string }) {
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerSrc, setPlayerSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setPlayerSrc(null);
    setError(null);
    setShowNextEpisode(false);
    lastProgressRef.current = 0;

    fetch(src, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Playback is currently unavailable.");
        const data: unknown = await response.json();
        if (!data || typeof data !== "object" || !("url" in data) || typeof data.url !== "string") {
          throw new Error("Playback source was not returned.");
        }
        setPlayerSrc(data.url);
        recordEvent({ type: "watch_start", contentId, contentType, genreIds, title });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Playback is currently unavailable.");
      });

    return () => controller.abort();
  }, [src, contentId, contentType, genreIds, title]);

  useEffect(() => {
    if (!nextEpisodeUrl) return;

    const handlePlayerMessage = (event: MessageEvent<unknown>) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = typeof event.data === "string"
        ? (() => {
            try {
              return JSON.parse(event.data) as unknown;
            } catch {
              return event.data;
            }
          })()
        : event.data;
      if (!data || typeof data !== "object") return;

      const message = data as Record<string, unknown>;
      const currentTime = typeof message.currentTime === "number" ? message.currentTime : undefined;
      const duration = typeof message.duration === "number" ? message.duration : undefined;
      const remaining = typeof message.remaining === "number"
        ? message.remaining
        : currentTime !== undefined && duration !== undefined
          ? duration - currentTime
          : undefined;
      const eventName = typeof message.event === "string" ? message.event.toLowerCase() : "";
      const completionPercentage = currentTime !== undefined && duration && duration > 0 ? Math.round((currentTime / duration) * 100) : undefined;
      if (completionPercentage !== undefined && currentTime !== undefined && (completionPercentage >= 90 || currentTime - lastProgressRef.current >= 30)) {
        recordEvent({
          type: eventName === "ended" || completionPercentage >= 98 ? "watch_complete" : "watch_progress",
          contentId,
          contentType,
          genreIds,
          title,
          durationSeconds: currentTime,
          completionPercentage,
          completed: eventName === "ended" || completionPercentage >= 98,
        });
        lastProgressRef.current = currentTime;
      }

      if (eventName === "ended" || (remaining !== undefined && remaining <= 60 && remaining >= 0)) {
        setShowNextEpisode(true);
      }
    };

    window.addEventListener("message", handlePlayerMessage);
    return () => window.removeEventListener("message", handlePlayerMessage);
  }, [nextEpisodeUrl, contentId, contentType, genreIds, title]);

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await playerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error("Unable to change player fullscreen state.", error);
    }
  };

  return (
    <div ref={playerRef} className="group relative aspect-video overflow-hidden rounded-xl bg-black shadow-2xl fullscreen:aspect-auto fullscreen:h-screen fullscreen:w-screen fullscreen:rounded-none">
      {playerSrc ? (
        <iframe
          ref={iframeRef}
          src={playerSrc}
          title="Video player"
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="origin"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
          <div>
            {error ? (
              <>
                <p className="font-semibold">{error}</p>
                <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-ember px-5 py-2 font-bold text-ink">
                  Try again
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-ember" />
                <p className="mt-3 text-sm text-white/70">Starting video…</p>
              </>
            )}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="absolute bottom-3 right-3 z-10 rounded-md border border-white/20 bg-black/60 p-2 text-white opacity-0 shadow-lg backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100 focus-visible:opacity-100"
      >
        {isFullscreen ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3v6H3M15 21v-6h6M3 15h6v6M21 9h-6V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {nextEpisodeUrl && showNextEpisode && (
        <Link
          href={nextEpisodeUrl}
          className="absolute bottom-20 left-auto right-3 z-10 rounded-md border border-white/20 bg-black/75 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-ember hover:text-ink"
        >
          Next episode →
        </Link>
      )}
    </div>
  );
}
