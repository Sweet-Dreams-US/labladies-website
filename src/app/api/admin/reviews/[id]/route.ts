import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { UUID, bad, readJson, requireAdmin } from "@/lib/admin-route";
import { REVIEWS_TAG, cleanReview, deleteReview, updateReview } from "@/lib/reviews";
import { logActivity } from "@/lib/tracking";

type Ctx = { params: Promise<{ id: string }> };

function publish() {
  revalidateTag(REVIEWS_TAG, { expire: 0 });
  revalidatePath("/", "layout");
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return bad("Not a valid id.");
  const body = await readJson(req);
  if (!body) return bad("Expected a JSON object.");

  const r = cleanReview(body, true);
  if (!r.ok) return bad(r.error);
  if (!Object.keys(r.row).length) return bad("Nothing to change.");

  const ok = await updateReview(id, r.row);
  if (!ok) return bad("Couldn't save that change.", 502);
  publish();
  await logActivity("review", id, "update", `Updated a review (${Object.keys(r.row).join(", ")}).`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return bad("Not a valid id.");
  const ok = await deleteReview(id);
  if (!ok) return bad("Couldn't delete that.", 502);
  publish();
  await logActivity("review", id, "delete", "Deleted a review.");
  return NextResponse.json({ ok: true });
}
