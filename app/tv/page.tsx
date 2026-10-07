import BrowsePage, { BrowseError } from "@/components/BrowsePage";
import { tmdbService } from "@/services/tmdbService";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const metadata = pageMetadata("TV Shows — 4PLEX", "Explore popular and top-rated TV shows on 4PLEX.", "/tv");

export default async function TvPage() {
  try {
    const [popular, topRated] = await Promise.all([
      tmdbService.popular("tv"), tmdbService.topRated("tv"),
    ]);
    return <BrowsePage title="TV Shows" rows={[
      { title: "Popular TV Shows", items: popular },
      { title: "Top Rated TV Shows", items: topRated },
    ]} />;
  } catch {
    return <BrowseError />;
  }
}
