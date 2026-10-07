import BrowsePage, { BrowseError } from "@/components/BrowsePage";
import { tmdbService } from "@/services/tmdbService";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const metadata = pageMetadata("Movies — 4PLEX", "Browse popular, top-rated, and currently playing movies on 4PLEX.", "/movies");

export default async function MoviesPage() {
  try {
    const [popular, topRated, nowPlaying] = await Promise.all([
      tmdbService.popular("movie"), tmdbService.topRated("movie"), tmdbService.nowPlaying(),
    ]);
    return <BrowsePage title="Movies" rows={[
      { title: "Popular Movies", items: popular },
      { title: "Top Rated Movies", items: topRated },
      { title: "Now Playing", items: nowPlaying },
    ]} />;
  } catch {
    return <BrowseError />;
  }
}
