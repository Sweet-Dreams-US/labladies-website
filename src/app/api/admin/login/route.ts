import { NextResponse } from "next/server";
import { authEnabled, checkPasscode, startSession } from "@/lib/admin-auth";
import { bad, readJson } from "@/lib/admin-route";

export async function POST(req: Request) {
  if (!authEnabled()) return bad("Admin is not configured.", 503);

  const body = await readJson(req);
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  if (!checkPasscode(passcode)) return bad("That passcode didn't work.", 401);

  await startSession();
  return NextResponse.json({ ok: true });
}
