import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";

/** The bits every admin route repeats. */

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const unauthorised = () =>
  NextResponse.json({ error: "Not authorised." }, { status: 401 });

export const bad = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

export async function requireAdmin() {
  return (await isAuthed()) ? null : unauthorised();
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json();
    return b && typeof b === "object" && !Array.isArray(b) ? b : null;
  } catch {
    return null;
  }
}

/**
 * Copy only the keys a route is willing to accept.
 *
 * Whitelisting rather than spreading the body matters more here than usual:
 * it is what guarantees a client cannot invent a column, and in particular
 * cannot smuggle clinical content into a table that has nowhere to put it.
 */
export function pick<T extends Record<string, unknown>>(
  body: Record<string, unknown>,
  keys: readonly string[],
): T {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in body) out[k] = body[k];
  return out as T;
}
