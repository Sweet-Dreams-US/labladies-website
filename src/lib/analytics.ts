import "server-only";
import { createHmac } from "node:crypto";
import { site } from "./site";

/**
 * First-party, cookie-free visit counting for the admin dashboard.
 *
 * Why this exists alongside Vercel Web Analytics: showing Vercel's numbers in
 * the admin would need a Vercel API token in this project, and Vercel tokens
 * can't be scoped to one project — a leak would expose every Sweet Dreams
 * client. So Vercel's dashboard is for Cole, and this is for Michelle.
 *
 * What is stored per page view: the path, the referring *host* (not the full
 * URL), the country Vercel's edge reports, phone/tablet/desktop, and a visitor
 * code. No IP address, no cookie. The visitor code is an HMAC of
 * (day + IP + browser) under a server-only key, so one person counts once a
 * day and cannot be followed from one day to the next. The privacy policy
 * describes exactly this; change one, change the other.
 */

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const PUBLISHABLE = process.env.SUPABASE_PUBLISHABLE_KEY;
const ADMIN_TOKEN = process.env.SUPABASE_ADMIN_TOKEN;

const headers = () => ({
  apikey: PUBLISHABLE!,
  Authorization: `Bearer ${PUBLISHABLE!}`,
  "x-admin-token": ADMIN_TOKEN!,
  "Content-Type": "application/json",
});

const enabled = () => Boolean(URL_BASE && PUBLISHABLE && ADMIN_TOKEN);

/** Crawlers, uptime checkers, link previewers — none of them are visitors. */
const BOT =
  /bot|crawl|spider|slurp|preview|fetch|monitor|lighthouse|headless|curl|wget|python|axios|node-fetch|go-http|java\/|facebookexternalhit|whatsapp|embedly|vercel/i;

export const isBot = (ua: string) => !ua || BOT.test(ua);

export function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

/** Today's date in Eastern time — the day the visitor code rotates on. */
const easternDay = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());

export function visitorCode(ip: string, ua: string) {
  return createHmac("sha256", `ll-visitor:${ADMIN_TOKEN}`)
    .update(`${easternDay()}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 16);
}

/** Host only, with our own site (and www/aliases of it) treated as no referrer. */
export function referrerHost(ref: unknown): string | null {
  if (typeof ref !== "string" || !ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
    const own = new URL(site.url).hostname.replace(/^www\./, "");
    if (host === own || host.endsWith(".vercel.app") || host.startsWith("labladies.") || host.startsWith("lab-ladies.")) {
      return null;
    }
    // Group Google's many country domains and Bing/DuckDuckGo variants.
    if (/(^|\.)google\./.test(host)) return "google.com";
    if (/(^|\.)bing\.com$/.test(host)) return "bing.com";
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export async function recordPageview(row: {
  path: string;
  referrer: string | null;
  country: string | null;
  device: string;
  visitor: string;
}) {
  if (!enabled()) return;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/ll_pageviews`, {
      method: "POST",
      cache: "no-store",
      headers: { ...headers(), Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) console.error("[ll:pageview-failed]", res.status, await res.text());
  } catch (err) {
    console.error("[ll:pageview-exception]", err);
  }
}

export type Bucket = { label: string; views: number };

export type AnalyticsSummary = {
  views: number;
  visitors: number;
  prev_views: number;
  prev_visitors: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: Bucket[];
  referrers: Bucket[];
  devices: Bucket[];
  countries: Bucket[];
};

export async function getAnalyticsSummary(days: number): Promise<AnalyticsSummary | null> {
  if (!enabled()) return null;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/rpc/ll_analytics_summary`, {
      method: "POST",
      cache: "no-store",
      headers: headers(),
      body: JSON.stringify({ p_days: days }),
    });
    if (!res.ok) {
      console.error("[ll:analytics-failed]", res.status, await res.text());
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[ll:analytics-exception]", err);
    return null;
  }
}
