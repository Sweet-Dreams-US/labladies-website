import "server-only";

/**
 * Cloudflare Turnstile — server-side check.
 *
 * Every form on the site (the callback form and the admin sign-in) sends a
 * Turnstile token with its submission; this confirms it with Cloudflare
 * before anything is stored or any password is compared.
 *
 * Enforcement switches on only when BOTH keys are configured. If the secret
 * were set but the site key missing, the widget would never render, no token
 * would ever arrive, and every submission — and every admin sign-in — would
 * be refused. A half-configured deploy degrades to "no bot check", not
 * "nobody gets in".
 *
 * Failure policy, deliberately asymmetric:
 *   - missing, invalid, expired, reused or wrong-form token → refuse.
 *   - Cloudflare unreachable or erroring → allow, and log it loudly. A real
 *     person asking for a blood draw should not be turned away because a
 *     third party is down; one spam submission during an outage is the
 *     cheaper failure.
 */

const SECRET = process.env.TURNSTILE_SECRET_KEY;
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const turnstileEnforced = () => Boolean(SECRET && SITE_KEY);

export type TurnstileAction = "inquiry" | "admin-login";

export type TurnstileResult =
  | { ok: true; skipped?: "not-configured" | "cloudflare-unreachable" }
  | { ok: false; reason: string };

/** The visitor's IP, as Vercel reports it. Optional to Cloudflare, but it helps. */
export function clientIp(req: Request): string | undefined {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    undefined
  );
}

export async function verifyTurnstile(
  token: unknown,
  action: TurnstileAction,
  ip?: string,
): Promise<TurnstileResult> {
  if (!turnstileEnforced()) return { ok: true, skipped: "not-configured" };

  // Cloudflare tokens are at most 2048 characters; anything else is junk and
  // not worth a network round trip.
  if (typeof token !== "string" || !token || token.length > 2048) {
    return { ok: false, reason: "missing-token" };
  }

  const body = new URLSearchParams({ secret: SECRET!, response: token });
  if (ip) body.set("remoteip", ip);

  let data: {
    success?: boolean;
    action?: string;
    hostname?: string;
    "error-codes"?: string[];
  };

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
      // Don't hold a form submission hostage to a slow third party.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error("[turnstile:http-error]", res.status);
      return { ok: true, skipped: "cloudflare-unreachable" };
    }
    data = await res.json();
  } catch (err) {
    console.error("[turnstile:unreachable]", err);
    return { ok: true, skipped: "cloudflare-unreachable" };
  }

  if (!data.success) {
    const codes = data["error-codes"] ?? [];
    // A bad secret is our misconfiguration, not a bot. Fail open, like an
    // outage, rather than locking every visitor out over a typo in Vercel.
    if (codes.includes("invalid-input-secret") || codes.includes("missing-input-secret")) {
      console.error("[turnstile:misconfigured-secret]", codes);
      return { ok: true, skipped: "cloudflare-unreachable" };
    }
    return { ok: false, reason: codes.join(",") || "rejected" };
  }

  // A token minted for one form can't be replayed against the other. Test
  // keys return no action, so only compare when Cloudflare sent one.
  if (data.action && data.action !== action) {
    return { ok: false, reason: `wrong-action:${data.action}` };
  }

  return { ok: true };
}
