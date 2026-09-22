import { NextResponse } from "next/server";
import { UUID, bad, pick, readJson, requireAdmin } from "@/lib/admin-route";
import { deleteInquiry, updateInquiry } from "@/lib/inquiries";
import { clearAlertMarks, clearAllAlertMarks, logActivity } from "@/lib/tracking";
import { INQUIRY_STATUS_LABEL, type Inquiry, type InquiryStatus } from "@/lib/inquiry-types";

/** Triage only. Nothing here may rewrite what the person actually submitted. */
const FIELDS = ["status", "admin_notes", "contacted_at", "archived_at"] as const;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return bad("Not a valid id.");

  const body = await readJson(req);
  if (!body) return bad("Expected a JSON object.");

  const patch = pick<Partial<Inquiry>>(body, FIELDS);
  if (!Object.keys(patch).length) return bad("Nothing to change.");

  if (patch.status && !(patch.status in INQUIRY_STATUS_LABEL)) {
    return bad("Not a valid status.");
  }

  const ok = await updateInquiry(id, patch);
  if (!ok) return bad("Couldn't save that change.", 502);

  // Off "new" means somebody has dealt with it, so stop nagging. If it ever
  // goes back to "new" the clock legitimately restarts.
  if (patch.status && patch.status !== "new") {
    await clearAlertMarks(id, ["inquiry_uncontacted"]);
  }

  await logActivity(
    "inquiry",
    id,
    "update",
    patch.status
      ? `Marked an inquiry as ${INQUIRY_STATUS_LABEL[patch.status as InquiryStatus]}.`
      : "Updated an inquiry note.",
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return bad("Not a valid id.");

  const ok = await deleteInquiry(id);
  if (!ok) return bad("Couldn't delete that.", 502);

  await clearAllAlertMarks(id);

  await logActivity("inquiry", id, "delete", "Deleted an inquiry.");
  return NextResponse.json({ ok: true });
}
