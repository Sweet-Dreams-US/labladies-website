import type { NextConfig } from "next";
import { aliasDomains, site } from "./src/lib/site";

const canonicalHost = new URL(site.url).host; // "labladies.com"

/**
 * Every host that should land on the canonical one: each alias domain, its
 * www., and www. of the canonical domain itself.
 *
 * Vercel's own "Redirect to" setting on each domain does the same job, and
 * should be set too. This is the backstop — a domain added in the dashboard
 * without that setting would otherwise serve a full duplicate copy of the
 * site, and Google splits ranking across duplicates.
 */
const redirectHosts = [
  `www.${canonicalHost}`,
  ...aliasDomains.flatMap((d) => [d, `www.${d}`]),
];

const nextConfig: NextConfig = {
  async redirects() {
    return redirectHosts.map((host) => ({
      // Everything except the cron endpoint. Vercel calls the cron on the
      // production domain and does not follow redirects; if the primary
      // domain were ever set to an alias, a 308 here would silently stop the
      // overdue-alert email.
      source: "/:path((?!api/cron/).*)",
      has: [{ type: "host" as const, value: host }],
      destination: `${site.url}/:path`,
      // 308: permanent, so search engines move the ranking over, and it keeps
      // the request method, so a form POST that lands on an alias isn't
      // quietly turned into a GET.
      permanent: true,
    }));
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        /**
         * Keep every non-canonical host out of the index — chiefly
         * labladies-website.vercel.app, which is a complete working copy of
         * the site and would otherwise compete with labladies.com in search.
         *
         * Headers rather than a redirect on purpose: the vercel.app address
         * has to keep working, both for preview deploys and as the way into
         * /admin until DNS for labladies.com has propagated.
         */
        source: "/:path*",
        missing: [{ type: "host", value: canonicalHost }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // The tracking board lists patient names. Never indexed, never cached
        // by a browser or a proxy.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
      {
        source: "/admin",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
