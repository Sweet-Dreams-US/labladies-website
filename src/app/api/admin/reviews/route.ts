import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { bad, readJson, requireAdmin } from "@/lib/admin-route";
import { REVIEWS_TAG, cleanReview, createReview } from "@/lib/reviews";
import { logActivity } from "@/lib/tracking";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await readJson(req);
  if (!body) return bad("Expected a JSON object.");

  const r = cleanReview(body, false);
  if (!r.ok) return bad(r.error);

  const id = await createReview(r.row);
  if (!id) return bad("Couldn't save that review. Try again.", 502);

  // Live on the next page load — see lib/settings.ts for why `expire: 0`.
  revalidateTag(REVIEWS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  await logActivity("review", id, "create", `Added a ${r.row.rating}-star review.`);
  return NextResponse.json({ ok: true, id });
}
