import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { bad, readJson, requireAdmin } from "@/lib/admin-route";
import { SETTINGS_TAG, normaliseGoogleUrl, updateSiteSettings } from "@/lib/settings";
import { logActivity } from "@/lib/tracking";

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await readJson(req);
  if (!body) return bad("Expected a JSON object.");

  const patch: Record<string, string | null> = {};
  for (const key of ["google_review_url", "google_business_url"] as const) {
    if (!(key in body)) continue;
    const r = normaliseGoogleUrl(body[key]);
    if (!r.ok) {
      return bad(
        "That doesn't look like a Google link. Copy it straight from your Google Business Profile — it should start with https://g.page, https://share.google or https://maps.app.goo.gl.",
      );
    }
    patch[key] = r.value;
  }
  if (!Object.keys(patch).length) return bad("Nothing to change.");

  const ok = await updateSiteSettings(patch);
  if (!ok) return bad("Couldn't save that. Try again.", 502);

  // Live on the next page load. `expire: 0` rather than the "max" profile:
  // Michelle should see her button on the site the moment she looks, not
  // after one stale visit.
  revalidateTag(SETTINGS_TAG, { expire: 0 });
  revalidatePath("/", "layout");

  await logActivity("settings", null, "update", `Updated ${Object.keys(patch).join(", ")}.`);
  return NextResponse.json({ ok: true, ...patch });
}
