import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin session for the Lab Ladies tracking board.
 *
 * One shared passcode (ADMIN_PASSCODE) exchanged for an HMAC-signed httpOnly
 * cookie — the same model the other Sweet Dreams sites use. Michelle, Sandra
 * and the office share it; who actually drew the blood is recorded as data on
 * the encounter (the phlebotomist field), not inferred from the login.
 *
 * The signing secret is derived from the passcode, so rotating the passcode
 * invalidates every outstanding session for free.
 *
 * Session length is deliberately shorter than the other sites': this board
 * carries patient names, and it is used on a phone in the field.
 */

const COOKIE = "ll_admin";
const TTL_MS = 1000 * 60 * 60 * 8; // 8 hours — one working day

const passcode = () => process.env.ADMIN_PASSCODE || "";

export const authEnabled = () => passcode().length > 0;

const sign = (payload: string) =>
  createHmac("sha256", `ll-admin:${passcode()}`).update(payload).digest("hex");

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

export function checkPasscode(input: string) {
  const expected = passcode();
  if (!expected) return false;
  return safeEqual(input, expected);
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
