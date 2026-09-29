import { deviceOf, isBot, recordPageview, referrerHost, visitorCode } from "@/lib/analytics";
import { clientIp } from "@/lib/turnstile";
import { site } from "@/lib/site";

/**
 * Page-view beacon. Called by PageviewTracker on every public page.
 *
 * Always answers 204 and never throws: a counting hiccup must never be
 * visible to a visitor. Only real visits on the official domain count —
 * preview deploys, localhost and the vercel.app address are ignored, so
 * testing never pollutes Michelle's numbers.
 */
const OFFICIAL_HOST = new URL(site.url).host;

export async function POST(req: Request) {
  const done = () => new Response(null, { status: 204 });

  if (req.headers.get("host") !== OFFICIAL_HOST) return done();

  // Same-origin only: a form or script on another site can't inflate counts.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== OFFICIAL_HOST) return done();

  const ua = req.headers.get("user-agent") || "";
  if (isBot(ua)) return done();

  let body: { path?: unknown; referrer?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return done();
  }

  if (typeof body.path !== "string") return done();
  const path = body.path.split(/[?#]/)[0].slice(0, 300);
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return done();

  await recordPageview({
    path,
    referrer: referrerHost(body.referrer),
    country: req.headers.get("x-vercel-ip-country")?.slice(0, 2) || null,
    device: deviceOf(ua),
    visitor: visitorCode(clientIp(req) || "unknown", ua),
  });

  return done();
}
