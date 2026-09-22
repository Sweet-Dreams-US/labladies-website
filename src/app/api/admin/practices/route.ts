import { NextResponse } from "next/server";
import { bad, pick, readJson, requireAdmin } from "@/lib/admin-route";
import { createPractice, logActivity } from "@/lib/tracking";

const FIELDS = [
  "name",
  "organization",
  "kind",
  "phone",
  "email",
  "fax",
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

  const id = await createPractice(row);
  if (!id) return bad("Couldn't save that practice.", 502);

  await logActivity("practice", id, "create", `Added the practice ${row.name}.`);
  return NextResponse.json({ ok: true, id });
}
