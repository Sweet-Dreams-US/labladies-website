import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The tracking board is passcode-gated, but keep it out of the index
      // entirely so the URL never surfaces in a search result.
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
