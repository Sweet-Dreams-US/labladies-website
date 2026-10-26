import "server-only";

/**
 * Customer reviews for the homepage strip, managed in /admin/reviews.
 *
 * The public read uses the bare publishable key and is cached under a tag; a
 * save in the admin expires the tag, so a review appears (or disappears) on
 * the next page load. What the public can read at all is decided by the
 * database, not here: only rows that are switched on AND rated 4 or 5 stars.
 *
 * Reviews are copied in by hand from Google (or wherever they were left).
 * They're shown word for word — never edited, never written by us.
 */

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const PUBLISHABLE = process.env.SUPABASE_PUBLISHABLE_KEY;
const ADMIN_TOKEN = process.env.SUPABASE_ADMIN_TOKEN;

export const REVIEWS_TAG = "ll_reviews";

export type ReviewSource = "google" | "facebook" | "yelp" | "direct";

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  review_date: string | null;
  source: ReviewSource;
  source_url: string | null;
  visible: boolean;
  sort_order: number;
  created_at: string;
};

export const SOURCE_LABEL: Record<ReviewSource, string> = {
  google: "Google review",
  facebook: "Facebook review",
  yelp: "Yelp review",
  direct: "Client review",
};

/**
 * "Margaret Thompson" → "Margaret T."
 *
 * Same rule the site applies to its owners: first name and last initial.
 * Reviewers are often older adults, and a full name next to a lab service is
 * more than a review needs to carry.
 */
export function displayName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "";
  const last = parts[parts.length - 1].replace(/[^\p{L}]/gu, "");
  return last ? `${parts[0]} ${last[0].toUpperCase()}.` : parts[0];
}

const base = () => ({
  apikey: PUBLISHABLE!,
  Authorization: `Bearer ${PUBLISHABLE!}`,
  "Content-Type": "application/json",
});
const admin = () => ({ ...base(), "x-admin-token": ADMIN_TOKEN! });

const ORDER = "order=sort_order.asc,review_date.desc.nullslast,created_at.desc";

/** What the homepage shows. Never throws — a hiccup just hides the strip. */
export async function listPublicReviews(): Promise<Review[]> {
  if (!URL_BASE || !PUBLISHABLE) return [];
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/ll_reviews?select=*&${ORDER}&limit=60`, {
      headers: base(),
      next: { tags: [REVIEWS_TAG], revalidate: 3600 },
    });
    if (!res.ok) return [];
    return (await res.json()) as Review[];
  } catch {
    return [];
  }
}

const adminReady = () => Boolean(URL_BASE && PUBLISHABLE && ADMIN_TOKEN);

export async function listAllReviews(): Promise<Review[]> {
  if (!adminReady()) return [];
  const res = await fetch(`${URL_BASE}/rest/v1/ll_reviews?select=*&${ORDER}`, {
    headers: admin(),
    cache: "no-store",
  });
  return res.ok ? ((await res.json()) as Review[]) : [];
}

export async function createReview(row: Partial<Review>): Promise<string | null> {
  if (!adminReady()) return null;
  const id = crypto.randomUUID();
  const res = await fetch(`${URL_BASE}/rest/v1/ll_reviews`, {
    method: "POST",
    cache: "no-store",
    headers: { ...admin(), Prefer: "return=minimal" },
    body: JSON.stringify({ id, ...row }),
  });
  if (!res.ok) console.error("[ll:review-insert-failed]", res.status, await res.text());
  return res.ok ? id : null;
}

export async function updateReview(id: string, patch: Partial<Review>): Promise<boolean> {
  if (!adminReady()) return false;
  const res = await fetch(`${URL_BASE}/rest/v1/ll_reviews?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    cache: "no-store",
    headers: { ...admin(), Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) console.error("[ll:review-update-failed]", res.status, await res.text());
  return res.ok;
}

export async function deleteReview(id: string): Promise<boolean> {
  if (!adminReady()) return false;
  const res = await fetch(`${URL_BASE}/rest/v1/ll_reviews?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
    headers: { ...admin(), Prefer: "return=minimal" },
  });
  return res.ok;
}

/** Validate an admin submission into the columns the table accepts. */
export function cleanReview(
  body: Record<string, unknown>,
  partial: boolean,
): { ok: true; row: Partial<Review> } | { ok: false; error: string } {
  const row: Partial<Review> = {};
  const has = (k: string) => k in body;

  if (has("author_name") || !partial) {
    const v = typeof body.author_name === "string" ? body.author_name.trim() : "";
    if (!v || v.length > 80) return { ok: false, error: "Add the reviewer's name (as it appears on Google)." };
    row.author_name = v;
  }
  if (has("rating") || !partial) {
    const v = Number(body.rating);
    if (!Number.isInteger(v) || v < 1 || v > 5) return { ok: false, error: "Pick a star rating from 1 to 5." };
    row.rating = v;
  }
  if (has("body") || !partial) {
    const v = typeof body.body === "string" ? body.body.trim() : "";
    if (!v || v.length > 1500) return { ok: false, error: "Paste the review text (up to 1,500 characters)." };
    row.body = v;
  }
  if (has("review_date")) {
    const v = typeof body.review_date === "string" ? body.review_date.trim() : "";
    if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { ok: false, error: "That date doesn't look right." };
    row.review_date = v || null;
  }
  if (has("source")) {
    const v = String(body.source);
    if (!(v in SOURCE_LABEL)) return { ok: false, error: "Unknown review source." };
    row.source = v as ReviewSource;
  }
  if (has("source_url")) {
    const v = typeof body.source_url === "string" ? body.source_url.trim() : "";
    if (v && !/^https:\/\//i.test(v)) return { ok: false, error: "The link should start with https://" };
    row.source_url = v || null;
  }
  if (has("visible")) row.visible = Boolean(body.visible);
  if (has("sort_order")) {
    const v = Number(body.sort_order);
    if (Number.isFinite(v)) row.sort_order = Math.round(v);
  }
  return { ok: true, row };
}
