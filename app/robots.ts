import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/profile", "/my-list", "/watch/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
