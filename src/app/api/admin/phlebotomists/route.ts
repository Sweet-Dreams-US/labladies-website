import { NextResponse } from "next/server";
import { bad, pick, readJson, requireAdmin } from "@/lib/admin-route";
import { createPhlebotomist, logActivity } from "@/lib/tracking";

const FIELDS = [
  "name",
  "initials",
  "active",
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

  const id = await createPhlebotomist(row);
  if (!id) return bad("Couldn't save that team member.", 502);

  await logActivity("phlebotomist", id, "create", `Added the team member ${row.name}.`);
  return NextResponse.json({ ok: true, id });
}
