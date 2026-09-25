import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Web app manifest — what Android Chrome uses when someone adds the site to
 * their home screen, and where it gets the icon and splash colours.
 *
 * `display: "browser"` on purpose. "standalone" would open the site without
 * an address bar, which suits an app but not a brochure site whose visitors
 * need to share links, go back, and see they're on the real domain.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.shortName} — Mobile Lab Services`,
    short_name: site.shortName,
    description:
      "Nurse-owned concierge mobile laboratory services in Palm Beach and Broward County.",
    start_url: "/",
    scope: "/",
    display: "browser",
    background_color: "#fdf6ec",
    theme_color: "#de0f0d",
    lang: "en-US",
    categories: ["health", "medical"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Logo kept inside the 80% safe zone, because Android crops these to
      // whatever shape the launcher uses.
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
