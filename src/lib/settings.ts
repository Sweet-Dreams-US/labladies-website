import "server-only";

/**
 * Public-site settings Michelle edits in /admin/settings — today, the two
 * Google Business Profile links.
 *
 * Read by every public page (the review and "find us on Google" buttons,
 * the footer, the structured data), so the read is cached and tagged. A save
 * in the admin expires the tag immediately, which makes the change live on
 * the very next page load — no redeploy, nobody else involved.
 *
 * Reads use the bare publishable key: the table is public-read by design.
 * Writes need the admin token, and the database itself refuses any link that
 * isn't on a Google domain, so even a hijacked session can't point these
 * buttons at a phishing page.
 */

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const PUBLISHABLE = process.env.SUPABASE_PUBLISHABLE_KEY;
const ADMIN_TOKEN = process.env.SUPABASE_ADMIN_TOKEN;

export const SETTINGS_TAG = "ll_site_settings";

export type SiteSettings = {
  google_review_url: string | null;
  google_business_url: string | null;
  updated_at: string | null;
};

const EMPTY: SiteSettings = {
  google_review_url: null,
  google_business_url: null,
  updated_at: null,
};

/** Never throws: a settings hiccup must not take a public page down. */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!URL_BASE || !PUBLISHABLE) return EMPTY;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/ll_site_settings?id=eq.1&select=*`, {
      headers: { apikey: PUBLISHABLE, Authorization: `Bearer ${PUBLISHABLE}` },
      // Cached, and tagged so a save can expire it at once. The hour is only a
      // backstop in case an expiry is ever missed.
      next: { tags: [SETTINGS_TAG], revalidate: 3600 },
    });
    if (!res.ok) return EMPTY;
    const [row] = (await res.json()) as SiteSettings[];
    return row ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * Accept only https links on the hosts Google issues profile and review links
 * from. The database enforces the same rule; checking here too lets the admin
 * say *why* a link was refused instead of showing a database error.
 */
const GOOGLE_HOST =
  /^(www\.)?(g\.page|share\.google|maps\.app\.goo\.gl|goo\.gl|google\.[a-z.]+|search\.google\.com|business\.google\.com)$/i;

export function normaliseGoogleUrl(input: unknown): { ok: true; value: string | null } | { ok: false } {
  if (input === null || input === undefined) return { ok: true, value: null };
  if (typeof input !== "string") return { ok: false };
  const raw = input.trim();
  if (!raw) return { ok: true, value: null };
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    url.protocol = "https:";
    if (!GOOGLE_HOST.test(url.hostname)) return { ok: false };
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false };
  }
}

export async function updateSiteSettings(
  patch: Partial<Pick<SiteSettings, "google_review_url" | "google_business_url">>,
): Promise<boolean> {
  if (!URL_BASE || !PUBLISHABLE || !ADMIN_TOKEN) return false;
  const res = await fetch(`${URL_BASE}/rest/v1/ll_site_settings?id=eq.1`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      apikey: PUBLISHABLE,
      Authorization: `Bearer ${PUBLISHABLE}`,
      "x-admin-token": ADMIN_TOKEN,
      "Content-Type": "application/json",
      // representation, so a write that RLS silently filtered to zero rows is
      // caught as a failure rather than reported as saved.
      Prefer: "return=representation",
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    console.error("[ll:settings-update-failed]", res.status, await res.text());
    return false;
  }
  const rows = (await res.json()) as unknown[];
  return rows.length === 1;
}
