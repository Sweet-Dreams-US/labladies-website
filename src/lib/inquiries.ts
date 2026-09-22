import "server-only";
import type { Inquiry, NewInquiry } from "./inquiry-types";

/**
 * Inquiry storage.
 *
 * Two privilege levels, as elsewhere:
 *
 *   The publishable key alone can INSERT and nothing else — that is the
 *   website form's path, and RLS pins the fields a stranger may set so a
 *   submission cannot arrive pre-marked "booked" or carrying admin notes.
 *
 *   SUPABASE_ADMIN_TOKEN, sent as x-admin-token, is what unlocks reading them
 *   back and triaging them.
 *
 * Saving an inquiry never throws. A database hiccup must not cost Michelle
 * the lead — the caller carries on to the notification email regardless.
 */

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const PUBLISHABLE = process.env.SUPABASE_PUBLISHABLE_KEY;
const ADMIN_TOKEN = process.env.SUPABASE_ADMIN_TOKEN;

const TABLE = "ll_inquiries";

/** Can the form store anything at all? */
export const inquiryStorageEnabled = () => Boolean(URL_BASE && PUBLISHABLE);

/** Can we read and triage them? */
export const inquiryAdminEnabled = () => Boolean(URL_BASE && PUBLISHABLE && ADMIN_TOKEN);

const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: PUBLISHABLE!,
      Authorization: `Bearer ${PUBLISHABLE!}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

const restAsAdmin = (path: string, init: RequestInit = {}) =>
  rest(path, { ...init, headers: { "x-admin-token": ADMIN_TOKEN!, ...init.headers } });

/**
 * The id is minted here rather than read back from the insert: asking
 * PostgREST to return the new row needs SELECT, which an un-tokened request
 * does not have. Generating it up front keeps the public write blind.
 */
export async function saveInquiry(inquiry: NewInquiry): Promise<string | null> {
  if (!inquiryStorageEnabled()) return null;

  const id = crypto.randomUUID();
  try {
    const res = await rest(TABLE, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ id, ...inquiry }),
    });
    if (!res.ok) {
      console.error("[ll:inquiry-insert-failed]", res.status, await res.text());
      return null;
    }
    return id;
  } catch (err) {
    console.error("[ll:inquiry-insert-exception]", err);
    return null;
  }
}

/** Record whether the notification email actually went out. */
export async function markInquiryEmail(id: string, email_status: string) {
  if (!inquiryAdminEnabled()) return;
  try {
    await restAsAdmin(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ email_status }),
    });
  } catch (err) {
    console.error("[ll:inquiry-email-status-exception]", err);
  }
}

export async function listInquiries(): Promise<Inquiry[]> {
  if (!inquiryAdminEnabled()) return [];
  const res = await restAsAdmin(`${TABLE}?select=*&order=created_at.desc&limit=500`);
  if (!res.ok) {
    console.error("[ll:inquiry-list-failed]", res.status, await res.text());
    return [];
  }
  return res.json();
}

export async function updateInquiry(
  id: string,
  patch: Partial<Pick<Inquiry, "status" | "admin_notes" | "contacted_at" | "archived_at">>,
): Promise<boolean> {
  if (!inquiryAdminEnabled()) return false;
  const res = await restAsAdmin(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) console.error("[ll:inquiry-update-failed]", res.status, await res.text());
  return res.ok;
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (!inquiryAdminEnabled()) return false;
  const res = await restAsAdmin(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  if (!res.ok) console.error("[ll:inquiry-delete-failed]", res.status, await res.text());
  return res.ok;
}
