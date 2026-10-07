import type { Metadata } from "next";

export const productionSiteUrl = "https://4-plex.vercel.app";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
export const siteUrl = configuredSiteUrl === productionSiteUrl ? configuredSiteUrl : productionSiteUrl;
export const siteName = "4PLEX";
export const defaultDescription = "Discover movies and TV shows, explore trending titles, and find your next favorite watch on 4PLEX.";

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName,
    },
    twitter: { card: "summary", title, description },
  };
}
