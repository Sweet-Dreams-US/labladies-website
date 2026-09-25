import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * One rule for every crawler, including the AI ones (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended…). Being readable by AI search was part of
 * the brief on the 14 Sep call, so they are allowed in, not blocked.
 *
 * Non-canonical hosts (the vercel.app address, the alias domains) get an
 * `X-Robots-Tag: noindex` header from next.config.ts instead, which works
 * even though this file is served identically on every host.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The tracking board lists patient names. It is passcode-gated and
      // noindexed, but keep crawlers from even requesting it.
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
