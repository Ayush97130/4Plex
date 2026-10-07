import { tmdbService } from "@/services/tmdbService";
import HeroBanner from "@/components/HeroBanner";
import ContentRow from "@/components/ContentRow";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";
import { uniqueMedia } from "@/lib/recommendations";

export const revalidate = 3600;
const GENRES: [string, number, "movie" | "tv"][] = [["Action", 28, "movie"], ["Comedy", 35, "movie"], ["Sci-Fi", 878, "movie"], ["Thriller", 53, "movie"], ["Animation", 16, "movie"], ["Horror", 27, "movie"], ["Drama", 18, "movie"]];

const safeLoad = <T,>(load: Promise<T>, fallback: T) => load.catch(() => fallback);

export default async function Home() {
  const [trending, pm, ptv, topM, recent, ...genreRows] = await Promise.all([
    safeLoad(tmdbService.trending(), []),
    safeLoad(tmdbService.popular("movie"), []),
    safeLoad(tmdbService.popular("tv"), []),
    safeLoad(tmdbService.topRated("movie"), []),
    safeLoad(tmdbService.nowPlaying(), []),
    ...GENRES.map(([, id, t]) => safeLoad(tmdbService.byGenre(t, id), [])),
  ]);
  const hero = (trending.length > 0 ? trending : pm).filter((m) => m.backdrop).slice(0, 5);
  const assignedGenreKeys = new Set<string>();
  const exclusiveGenreRows = genreRows.map((items) => uniqueMedia(items).filter((item) => {
    const key = `${item.type}-${item.id}`;
    if (assignedGenreKeys.has(key)) return false;
    assignedGenreKeys.add(key);
    return true;
  }));
  return (
    <>
      <HeroBanner items={hero} />
      <div className="relative z-10 -mt-10">
        <PersonalizedRecommendations candidates={[...trending, ...pm, ...ptv, ...topM, ...recent, ...genreRows.flat()]} />
        <ContentRow title="Trending Now" items={trending} />
        <ContentRow title="Popular Movies" items={pm} />
        <ContentRow title="Popular TV Shows" items={ptv} />
        <ContentRow title="Top Rated" items={topM} />
        <ContentRow title="Recently Released" items={recent} />
        {GENRES.map(([name], i) => <ContentRow key={name} title={name} items={exclusiveGenreRows[i]} />)}
      </div>
    </>
  );
}
