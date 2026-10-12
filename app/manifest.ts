import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** Builds the web app manifest with site branding, standalone display, and icon URLs. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.product,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#05070b",
    theme_color: "#05070b",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
