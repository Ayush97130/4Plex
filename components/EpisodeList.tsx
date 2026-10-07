"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Episode } from "@/types/media";

export default function EpisodeList({
  id,
  seasons,
  currentSeason,
  currentEpisode,
  episodes,
}: {
  id: number;
  seasons: number;
  currentSeason: number;
  currentEpisode: number;
  episodes: Episode[];
}) {
  const router = useRouter();
  if (!seasons) return null;

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-panel/70 p-5 md:p-7" aria-label="Episodes">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <h2 className="text-2xl font-extrabold">Episodes</h2>
        <label className="flex items-center gap-3 text-sm font-semibold text-mute">
          <span className="sr-only">Choose season</span>
          <select
            value={currentSeason}
            onChange={(event) => router.push(`/watch/tv/${id}?s=${event.target.value}&e=1`)}
            className="rounded-lg border border-white/15 bg-raised px-3 py-2 text-bone outline-none focus:border-ember"
          >
            {Array.from({ length: seasons }, (_, index) => {
              const season = index + 1;
              return <option key={season} value={season}>Season {season}</option>;
            })}
          </select>
        </label>
      </div>

      {episodes.length ? (
        <div className="divide-y divide-white/10">
          {episodes.map((episode) => (
            <Link
              key={episode.id || episode.number}
              href={`/watch/tv/${id}?s=${currentSeason}&e=${episode.number}`}
              aria-current={episode.number === currentEpisode ? "page" : undefined}
              className={`group flex gap-4 py-4 transition-colors md:gap-5 ${episode.number === currentEpisode ? "rounded-lg bg-white/[.08] px-3" : "hover:bg-white/[.04]"}`}
            >
              <span className="w-5 shrink-0 self-center text-center text-lg font-semibold text-mute">{episode.number}</span>
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-raised md:h-24 md:w-40">
                {episode.still ? (
                  <Image src={`https://image.tmdb.org/t/p/w300${episode.still}`} alt="" fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-mute">No image</div>
                )}
                {episode.number === currentEpisode && <span className="absolute inset-0 grid place-items-center bg-black/35 text-2xl text-white">▶</span>}
              </div>
              <div className="min-w-0 flex-1 self-center">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold">{episode.name}</h3>
                  {episode.runtime && <span className="shrink-0 text-sm text-mute">{episode.runtime}m</span>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-mute">{episode.overview || "Episode description unavailable."}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-mute">Episodes are not available for this season.</p>
      )}
    </section>
  );
}
