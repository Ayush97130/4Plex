import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";
import { tmdbService } from "@/services/tmdbService";
import { uniqueMedia } from "@/lib/recommendations";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("Search Movies & TV Shows — 4PLEX", "Search the 4PLEX catalog for movies and TV shows.", "/search");

export default async function SearchPage() {
  const [trending, movies, tv] = await Promise.all([
    tmdbService.trending().catch(() => []),
    tmdbService.popular("movie").catch(() => []),
    tmdbService.popular("tv").catch(() => []),
  ]);
  const recommendationPool = uniqueMedia([...trending, ...movies, ...tv]);
  return (
    <Suspense fallback={<div className="px-4 pb-20 pt-24 text-mute md:px-10">Loading search...</div>}>
      <SearchClient recommendationPool={recommendationPool} trending={uniqueMedia(trending)} popularMovies={uniqueMedia(movies)} popularTv={uniqueMedia(tv)} />
    </Suspense>
  );
}
