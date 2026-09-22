import { NextResponse } from "next/server";
import { bad, pick, readJson, requireAdmin } from "@/lib/admin-route";
import { createLab, logActivity } from "@/lib/tracking";

const FIELDS = [
  "name",
  "short_code",
  "is_reference_lab",
  "requires_provider_account",
  "notes",
  "active",
  "sort_order",
] as const;

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await readJson(req);
  if (!body) return bad("Expected a JSON object.");

  const row = pick(body, FIELDS);
  if (typeof row.name !== "string" || !row.name.trim()) {
    return bad("A name is needed.");
  }

  const id = await createLab(row);
  if (!id) return bad("Couldn't save that laboratory.", 502);

  await logActivity("lab", id, "create", `Added the laboratory ${row.name}.`);
  return NextResponse.json({ ok: true, id });
}
