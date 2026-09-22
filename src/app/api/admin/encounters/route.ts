import { NextResponse } from "next/server";
import { bad, pick, readJson, requireAdmin } from "@/lib/admin-route";
import { ENCOUNTER_FIELDS } from "@/lib/encounter-fields";
import { createEncounter, logActivity } from "@/lib/tracking";
import type { NewEncounter } from "@/lib/tracking-types";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await readJson(req);
  if (!body) return bad("Expected a JSON object.");

  const row = pick<NewEncounter>(body, ENCOUNTER_FIELDS);
  if (typeof row.patient_name !== "string" || !row.patient_name.trim()) {
    return bad("A patient name is needed.");
  }

  const id = await createEncounter(row);
  if (!id) return bad("Couldn't save that collection.", 502);

  await logActivity("encounter", id, "create", `Added a collection for ${row.patient_name}.`);
  return NextResponse.json({ ok: true, id });
}
