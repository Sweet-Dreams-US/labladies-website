import { NextResponse } from "next/server";
import { UUID, bad, pick, readJson, requireAdmin } from "@/lib/admin-route";
import { updatePhlebotomist, deletePhlebotomist, logActivity } from "@/lib/tracking";

const FIELDS = [
  "name",
  "initials",
  "active",
] as const;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return bad("Not a valid id.");

  const body = await readJson(req);
  if (!body) return bad("Expected a JSON object.");

  const patch = pick(body, FIELDS);
  if (!Object.keys(patch).length) return bad("Nothing to change.");

  const ok = await updatePhlebotomist(id, patch);
  if (!ok) return bad("Couldn't save that change.", 502);

  await logActivity("phlebotomist", id, "update", `Updated a team member.`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return bad("Not a valid id.");

  /**
   * The encounter foreign keys are ON DELETE SET NULL, so removing a team member
   * never takes visit history with it — the old rows simply stop naming it.
   * Marking it inactive is still the better move and is what the UI suggests.
   */
  const ok = await deletePhlebotomist(id);
  if (!ok) return bad("Couldn't delete that.", 502);

  await logActivity("phlebotomist", id, "delete", `Deleted a team member.`);
  return NextResponse.json({ ok: true });
}
