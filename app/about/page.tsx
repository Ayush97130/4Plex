import type { Metadata } from "next";
import { pageMetadata, siteName } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("About 4PLEX", "Learn about 4PLEX, its discovery features, recommendations, and content sources.", "/about");

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://4plex.app",
  };
  return (
    <article className="relative z-10 mx-auto max-w-4xl px-4 py-16 md:px-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-4xl font-extrabold">About 4PLEX</h1>
      <p className="mt-4 text-lg text-mute">4PLEX is a movie and TV discovery application for finding titles, exploring genres, and keeping a personal list of what you want to watch.</p>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold">What You Can Do</h2><ul className="list-disc space-y-2 pl-6 text-mute"><li>Discover movies and TV shows.</li><li>Explore trending titles and genres.</li><li>Search the available catalog.</li><li>Create a personal list.</li><li>Receive recommendations based on available watch activity and preferences.</li></ul></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold">Recommendations</h2><p className="text-mute">Recommendations use available local watch-history and preference signals where present. When there is not enough history, 4PLEX falls back to popular and trending catalog data. Recommendation history is stored locally in the browser.</p></section>
      <section className="mt-10 space-y-4"><h2 className="text-2xl font-bold">Data &amp; Content Sources</h2><p className="text-mute">4PLEX uses The Movie Database (TMDB) API for movie and TV metadata, artwork references, and discovery information. 4PLEX is not endorsed or certified by TMDB.</p><p className="text-mute">Playback availability is provided through NexStream, a third-party streaming service used by the application. 4PLEX does not claim ownership of third-party metadata, artwork, or playback content.</p><p className="text-mute">4PLEX is the application interface and is separate from these third-party services. Service availability and catalog information may change without notice.</p></section>
    </article>
  );
}
