import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/movies", "/tv", "/trending", "/genres", "/search", "/about", "/contact", "/privacy", "/terms"];
  return paths.map((path) => ({ url: absoluteUrl(path), changeFrequency: "daily", priority: path === "/" ? 1 : 0.7 }));
}
