import { NextResponse } from "next/server";
import { authEnabled, checkCredentials, startSession } from "@/lib/admin-auth";
import { bad, readJson } from "@/lib/admin-route";
import { clientIp, verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: Request) {
  if (!authEnabled()) return bad("Admin is not configured.", 503);

  const body = await readJson(req);

  // Before the password is compared at all, so a bot can't use this endpoint
  // to test guesses.
  const bot = await verifyTurnstile(body?.turnstile_token, "admin-login", clientIp(req));
  if (!bot.ok) {
    console.warn("[admin-login:turnstile-rejected]", bot.reason);
    return bad("The security check didn't go through. Refresh the page and try again.", 400);
  }

  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  // One message for both failures: telling someone the email was right and
  // only the password wrong hands them half the credential.
  if (!checkCredentials(email, password)) {
    return bad("That email and password didn't match.", 401);
  }

  await startSession();
  return NextResponse.json({ ok: true });
}
