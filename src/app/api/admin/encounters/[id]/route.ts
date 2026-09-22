import { NextResponse } from "next/server";
import { UUID, bad, pick, readJson, requireAdmin } from "@/lib/admin-route";
import { ENCOUNTER_FIELDS } from "@/lib/encounter-fields";
import {
  clearAlertMarks,
  clearAllAlertMarks,
  deleteEncounter,
  logActivity,
  updateEncounter,
} from "@/lib/tracking";
import type { AlertRule, Encounter } from "@/lib/tracking-types";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return bad("Not a valid id.");

  const body = await readJson(req);
  if (!body) return bad("Expected a JSON object.");

  const patch = pick<Partial<Encounter>>(body, ENCOUNTER_FIELDS);
  if (!Object.keys(patch).length) return bad("Nothing to change.");

  const ok = await updateEncounter(id, patch);
  if (!ok) return bad("Couldn't save that change.", 502);

  /**
   * Completing a step clears its "already emailed about this" mark, so if the
   * same encounter stalls again later it can alert again rather than staying
   * permanently silent.
   */
  const cleared: AlertRule[] = [];
  if (patch.results_received === true) cleared.push("results_overdue");
  if (patch.results_sent === true) cleared.push("forward_overdue");
  if (patch.amount_paid !== undefined) cleared.push("payment_overdue");
  if (cleared.length) await clearAlertMarks(id, cleared);

  await logActivity(
    "encounter",
    id,
    "update",
    // Field names only — never the values, which include patient details.
    `Updated ${Object.keys(patch).join(", ")}.`,
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  if (!UUID.test(id)) return bad("Not a valid id.");

  const ok = await deleteEncounter(id);
  if (!ok) return bad("Couldn't delete that.", 502);

  await clearAllAlertMarks(id);

  await logActivity("encounter", id, "delete", "Deleted a collection record.");
  return NextResponse.json({ ok: true });
}
