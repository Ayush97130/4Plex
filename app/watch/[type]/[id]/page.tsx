import Link from "next/link";
import { notFound } from "next/navigation";
import WatchPlayer from "@/components/WatchPlayer";
import { tmdbService } from "@/services/tmdbService";
import EpisodeList from "@/components/EpisodeList";
import ContentRow from "@/components/ContentRow";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Watch({
  params,
  searchParams,
}: {
  params: { type: string; id: string };
  searchParams: { s?: string; e?: string };
}) {
  const type = params.type;
  const id = Number(params.id);
  if ((type !== "movie" && type !== "tv") || !Number.isInteger(id) || id <= 0) notFound();

  const season = Number(searchParams.s);
  const episode = Number(searchParams.e);
  const playbackUrl = new URLSearchParams({ type, id: String(id) });
  if (type === "tv") {
    playbackUrl.set("s", String(season > 0 ? season : 1));
    playbackUrl.set("e", String(episode > 0 ? episode : 1));
  }
  const currentSeason = type === "tv" && season > 0 ? season : 1;
  const currentEpisode = type === "tv" && episode > 0 ? episode : 1;
  const nextEpisodeUrl = type === "tv"
    ? `/watch/tv/${id}?s=${currentSeason}&e=${currentEpisode + 1}`
    : undefined;
  const detail = await tmdbService.detail(type, id);
  const episodeResult = type === "tv"
    ? await Promise.allSettled([tmdbService.season(id, currentSeason)])
    : [];
  const episodes = type === "tv" && episodeResult[0]?.status === "fulfilled" ? episodeResult[0].value : [];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-24 md:px-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <Link href={`/title/${type}/${id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-mute hover:text-bone">
          ← Back to details
        </Link>
        {type === "tv" && (
          <p className="text-sm text-mute">
            Season {season > 0 ? season : 1}, Episode {episode > 0 ? episode : 1}
          </p>
        )}
      </div>
      <WatchPlayer src={`/api/stream?${playbackUrl.toString()}`} contentId={id} contentType={type} genreIds={detail.genreIds} title={detail.title} poster={detail.poster} backdrop={detail.backdrop} season={type === "tv" ? currentSeason : undefined} episode={type === "tv" ? currentEpisode : undefined} nextEpisodeUrl={nextEpisodeUrl} />
      <p className="mt-4 text-sm text-mute">
        Playback is provided by NexStream. If the player does not load, verify that your API key is valid and domain-locked for this site.
      </p>
      {type === "tv" && (
        <EpisodeList
          id={id}
          seasons={detail.seasons ?? 0}
          currentSeason={currentSeason}
          currentEpisode={currentEpisode}
          episodes={episodes}
        />
      )}
      <div className="mt-10">
        <ContentRow title="More Like This" items={detail.similar ?? []} />
      </div>
    </section>
  );
}
