import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { nav, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = nav.map((item) => ({
    url: `${site.url}${item.href === "/" ? "" : item.href}`,
    lastModified: new Date(),
    changeFrequency: item.href === "/blog" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));

  // Posts carry their own publish date rather than today's, so a crawler can
  // tell which ones have actually changed.
  const articles: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T12:00:00Z`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...pages, ...articles];
}
