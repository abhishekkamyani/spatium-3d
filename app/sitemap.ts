import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// The dashboard is an app surface, not marketing content, so only the
// landing page is listed. Bump this date when the landing copy changes.
const LANDING_LAST_MODIFIED = "2026-10-11";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: LANDING_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
