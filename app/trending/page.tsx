import BrowsePage, { BrowseError } from "@/components/BrowsePage";
import { tmdbService } from "@/services/tmdbService";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const metadata = pageMetadata("Trending Movies & TV Shows — 4PLEX", "See the movies and TV shows trending on 4PLEX.", "/trending");

export default async function TrendingPage() {
  try {
    return <BrowsePage title="Trending" rows={[
      { title: "Trending This Week", items: await tmdbService.trending() },
    ]} />;
  } catch {
    return <BrowseError />;
  }
}
