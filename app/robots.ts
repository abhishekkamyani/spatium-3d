import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** Allows public crawling, excludes dashboard and API paths, and advertises the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
