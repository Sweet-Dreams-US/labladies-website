import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { nav, site, siteUpdated } from "@/lib/site";

/**
 * Sitemap for labladies.com.
 *
 * Built from `nav` and `posts`, so a new page or post is listed the moment it
 * exists. /admin and /api are never in here — they are not in `nav`, and
 * robots.ts disallows them as well.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pageDate = new Date(`${siteUpdated}T12:00:00Z`);

  const pages: MetadataRoute.Sitemap = nav.map((item) => ({
    url: `${site.url}${item.href === "/" ? "" : item.href}`,
    // A fixed content date, not the build time: stamping "today" on every page
    // at every deploy teaches Google the field means nothing.
    lastModified:
      item.href === "/blog" && posts.length
        ? new Date(`${[...posts].map((p) => p.date).sort().at(-1)}T12:00:00Z`)
        : pageDate,
    changeFrequency: item.href === "/blog" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : item.href === "/services" ? 0.9 : 0.8,
  }));

  const articles: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T12:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...pages, ...articles];
}
