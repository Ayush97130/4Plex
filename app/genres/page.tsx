import BrowsePage, { BrowseError } from "@/components/BrowsePage";
import { tmdbService } from "@/services/tmdbService";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const metadata = pageMetadata("Browse Movie & TV Genres — 4PLEX", "Browse movies by genre and discover your next watch on 4PLEX.", "/genres");
const GENRES: [string, number][] = [
  ["Action", 28], ["Comedy", 35], ["Science Fiction", 878],
  ["Thriller", 53], ["Animation", 16], ["Horror", 27], ["Drama", 18],
];

export default async function GenresPage() {
  try {
    const rows = await Promise.all(GENRES.map(async ([title, id]) => ({
      title, items: await tmdbService.byGenre("movie", id),
    })));
    return <BrowsePage title="Genres" rows={rows} />;
  } catch {
    return <BrowseError />;
  }
}
