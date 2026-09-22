import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin session for the Lab Ladies tracking board.
 *
 * Sign-in is the business email (ADMIN_EMAIL) plus a shared password
 * (ADMIN_PASSCODE), exchanged for an HMAC-signed httpOnly cookie.
 *
 * The email is a second thing you have to know rather than a user account —
 * there is one shared credential, not a users table. Michelle, Sandra and the
 * office use the same one; who actually drew the blood is recorded as data on
 * the encounter (the phlebotomist field), never inferred from the login. When
 * the team grows enough that "who changed this" matters, this is the file that
 * grows a users table, and the Activity page already has somewhere to put the
 * answer.
 *
 * The signing secret is derived from both values, so changing either one
 * invalidates every outstanding session for free.
 *
 * Session length is deliberately shorter than the other Sweet Dreams sites':
 * this board carries patient names, and it gets used on a phone in the field.
 */

const COOKIE = "ll_admin";
const TTL_MS = 1000 * 60 * 60 * 8; // 8 hours — one working day

const passcode = () => process.env.ADMIN_PASSCODE || "";
const adminEmail = () => (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

export const authEnabled = () => passcode().length > 0 && adminEmail().length > 0;

const sign = (payload: string) =>
  createHmac("sha256", `ll-admin:${adminEmail()}:${passcode()}`).update(payload).digest("hex");

/** Constant-time compare that tolerates a length mismatch without leaking it. */
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/**
 * Both halves are always compared, even when the email is already wrong, so
 * the time taken does not tell an attacker which half they got right.
 */
export function checkCredentials(email: string, input: string) {
  if (!authEnabled()) return false;
  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail());
  const passOk = safeEqual(input, passcode());
  return emailOk && passOk;
}

function mintToken() {
  const payload = `${Date.now() + TTL_MS}.${randomBytes(8).toString("hex")}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined) {
  if (!token || !authEnabled()) return false;

  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;

  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  if (!safeEqual(sig, sign(payload))) return false;

  const expiry = Number(payload.split(".")[0]);
  return Number.isFinite(expiry) && Date.now() < expiry;
}

export async function isAuthed() {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export async function startSession() {
  const jar = await cookies();
  jar.set(COOKIE, mintToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function endSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
