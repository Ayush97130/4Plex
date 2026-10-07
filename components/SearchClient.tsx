"use client";

import { startTransition, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MediaCard from "./MediaCard";
import type { Media } from "@/types/media";
import PersonalizedRecommendations from "./PersonalizedRecommendations";
import ContentRow from "./ContentRow";
import { ambientImage, publishAmbient } from "@/lib/ambient";

export default function SearchClient({ recommendationPool, trending, popularMovies, popularTv }: { recommendationPool: Media[]; trending: Media[]; popularMovies: Media[]; popularTv: Media[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      fetch(`/api/tmdb?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error("Search failed");
          const data = await response.json() as { results?: Media[] };
          startTransition(() => setResults(data.results ?? []));
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === "AbortError") return;
          startTransition(() => {
            setResults([]);
            setError("Search failed. Please try again.");
          });
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  useEffect(() => {
    const first = results[0];
    publishAmbient(first ? ambientImage(first.backdrop, first.poster) : null);
  }, [results]);

  return (
    <section className="mx-auto max-w-[1500px] px-4 pb-20 pt-24 md:px-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Search</h1>
      {loading && <p className="mt-8 text-mute">Searching...</p>}
      {!loading && error && <p role="alert" className="mt-8 text-red-300">{error}</p>}
      {!loading && !error && query.length > 0 && query.length < 2 && <p className="mt-8 text-mute">Enter at least 2 characters.</p>}
      {!loading && !error && query.length >= 2 && !results.length && <p className="mt-8 text-mute">No results found for “{query}”.</p>}
      {!!results.length && (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {results.map((media) => <MediaCard key={`${media.type}-${media.id}`} m={media} />)}
        </div>
      )}
      <div className="mt-12">
        <PersonalizedRecommendations candidates={recommendationPool} />
        <ContentRow title="Trending Now" items={trending} />
        <ContentRow title="Popular Movies" items={popularMovies} />
        <ContentRow title="Popular TV Shows" items={popularTv} />
      </div>
    </section>
  );
}
