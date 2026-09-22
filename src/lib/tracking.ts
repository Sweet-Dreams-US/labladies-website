import "server-only";
import type {
  Alert,
  AlertRule,
  Encounter,
  EncounterRow,
  Lab,
  NewEncounter,
  Phlebotomist,
  Practice,
  Reference,
} from "./tracking-types";
import { ALERT_DAYS } from "./tracking-types";

/**
 * Storage for the tracking board.
 *
 * One key, two privilege levels — the house pattern:
 *
 *   SUPABASE_PUBLISHABLE_KEY — sent on every call. On its own it can read
 *     nothing in the ll_ tables: every policy is gated on the admin token.
 *
 *   SUPABASE_ADMIN_TOKEN — sent as `x-admin-token`. PostgREST exposes request
 *     headers to RLS, and the ll_ policies unlock only when the sha256 of this
 *     header matches the row in the private schema.
 *
 * Deliberately NOT a service-role key: `FreeWebsites` is shared with other
 * clients' sites and a service-role key bypasses RLS on all of them. This
 * token's blast radius is exactly Lab Ladies' own tables. Server-only — it
 * must never be prefixed NEXT_PUBLIC_.
 */

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/$/, "");
const PUBLISHABLE = process.env.SUPABASE_PUBLISHABLE_KEY;
const ADMIN_TOKEN = process.env.SUPABASE_ADMIN_TOKEN;

export const trackingEnabled = () => Boolean(URL_BASE && PUBLISHABLE && ADMIN_TOKEN);

function rest(path: string, init: RequestInit = {}) {
  return fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: PUBLISHABLE!,
      Authorization: `Bearer ${PUBLISHABLE!}`,
      "x-admin-token": ADMIN_TOKEN!,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

async function list<T>(path: string): Promise<T[]> {
  if (!trackingEnabled()) return [];
  try {
    const res = await rest(path);
    if (!res.ok) {
      console.error("[ll:list-failed]", path, res.status, await res.text());
      return [];
    }
    return res.json();
  } catch (err) {
    console.error("[ll:list-exception]", path, err);
    return [];
  }
}

/** Ids are minted here rather than read back, so writes never need SELECT. */
async function insert(table: string, row: Record<string, unknown>): Promise<string | null> {
  if (!trackingEnabled()) return null;
  const id = crypto.randomUUID();
  const res = await rest(table, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ id, ...row }),
  });
  if (!res.ok) {
    console.error("[ll:insert-failed]", table, res.status, await res.text());
    return null;
  }
  return id;
}

async function patch(table: string, id: string, body: Record<string, unknown>) {
  if (!trackingEnabled()) return false;
  const res = await rest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error("[ll:update-failed]", table, res.status, await res.text());
  return res.ok;
}

async function remove(table: string, id: string) {
  if (!trackingEnabled()) return false;
  const res = await rest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  if (!res.ok) console.error("[ll:delete-failed]", table, res.status, await res.text());
  return res.ok;
}

/* -------------------------------------------------------------- audit trail */

/**
 * Append-only note of what changed. Summaries are written by the callers and
 * must stay clinical-content free — "marked results received", never what the
 * results said. Never throws: a failed audit write must not fail the edit.
 */
export async function logActivity(
  entity: string,
  entityId: string | null,
  action: string,
  summary: string,
) {
  try {
    await insert("ll_activity", { entity, entity_id: entityId, action, summary });
  } catch (err) {
    console.error("[ll:activity-exception]", err);
  }
}

export const listActivity = (limit = 60) =>
  list<{ id: string; entity: string; action: string; summary: string; created_at: string }>(
    `ll_activity?select=*&order=created_at.desc&limit=${limit}`,
  );

/* ---------------------------------------------------------------- reference */

export const listPractices = (includeInactive = false) =>
  list<Practice>(
    `ll_practices?select=*${includeInactive ? "" : "&active=is.true"}&order=sort_order,name`,
  );

export const listLabs = (includeInactive = false) =>
  list<Lab>(`ll_labs?select=*${includeInactive ? "" : "&active=is.true"}&order=sort_order,name`);

export const listPhlebotomists = (includeInactive = false) =>
  list<Phlebotomist>(
    `ll_phlebotomists?select=*${includeInactive ? "" : "&active=is.true"}&order=name`,
  );

export async function getReference(includeInactive = false): Promise<Reference> {
  const [practices, labs, phlebotomists] = await Promise.all([
    listPractices(includeInactive),
    listLabs(includeInactive),
    listPhlebotomists(includeInactive),
  ]);
  return { practices, labs, phlebotomists };
}

export const createPractice = (row: Partial<Practice>) => insert("ll_practices", row);
export const updatePractice = (id: string, row: Partial<Practice>) =>
  patch("ll_practices", id, row);
export const deletePractice = (id: string) => remove("ll_practices", id);

export const createLab = (row: Partial<Lab>) => insert("ll_labs", row);
export const updateLab = (id: string, row: Partial<Lab>) => patch("ll_labs", id, row);
export const deleteLab = (id: string) => remove("ll_labs", id);

export const createPhlebotomist = (row: Partial<Phlebotomist>) =>
  insert("ll_phlebotomists", row);
export const updatePhlebotomist = (id: string, row: Partial<Phlebotomist>) =>
  patch("ll_phlebotomists", id, row);
export const deletePhlebotomist = (id: string) => remove("ll_phlebotomists", id);

/* --------------------------------------------------------------- encounters */

export const createEncounter = (row: NewEncounter) => insert("ll_encounters", row);
export const updateEncounter = (id: string, row: Partial<Encounter>) =>
  patch("ll_encounters", id, row);
export const deleteEncounter = (id: string) => remove("ll_encounters", id);

export async function listEncounters(
  opts: { includeArchived?: boolean; limit?: number } = {},
): Promise<Encounter[]> {
  const { includeArchived = false, limit = 1000 } = opts;
  const q = includeArchived ? "" : "&archived_at=is.null";
  return list<Encounter>(
    `ll_encounters?select=*${q}&order=date_of_service.desc.nullslast,created_at.desc&limit=${limit}`,
  );
}

/**
 * Encounters with their practice / lab / phlebotomist attached.
 *
 * Joined here rather than with a PostgREST embed: the reference tables are a
 * few dozen rows total, so two flat reads and a map beat an embedded select
 * that has to be kept in sync with every column rename.
 */
export async function listEncounterRows(
  opts: { includeArchived?: boolean; limit?: number } = {},
): Promise<{ rows: EncounterRow[]; reference: Reference }> {
  const [encounters, reference] = await Promise.all([
    listEncounters(opts),
    // Inactive included: an encounter may point at a practice retired since.
    getReference(true),
  ]);

  const byId = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));
  const practices = byId(reference.practices);
  const labs = byId(reference.labs);
  const phlebs = byId(reference.phlebotomists);

  const rows = encounters.map((e) => ({
    ...e,
    practice: e.practice_id ? (practices.get(e.practice_id) ?? null) : null,
    lab: e.lab_id ? (labs.get(e.lab_id) ?? null) : null,
    phlebotomist: e.phlebotomist_id ? (phlebs.get(e.phlebotomist_id) ?? null) : null,
  }));

  return {
    rows,
    reference: {
      practices: reference.practices.filter((p) => p.active),
      labs: reference.labs.filter((l) => l.active),
      phlebotomists: reference.phlebotomists.filter((p) => p.active),
    },
  };
}

/* ------------------------------------------------------------------- alerts */

const DAY = 1000 * 60 * 60 * 24;

function daysSince(date: string | null): number | null {
  if (!date) return null;
  const then = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(then)) return null;
  return Math.floor((Date.now() - then) / DAY);
}

/**
 * The "nothing has happened in a week" check Michelle asked for on the call.
 *
 * The rules encode the distinction from her note about the labs. My Clinical
 * and GSB are local reference labs: she has chart access and owes the results
 * to the ordering practitioner, so both the "results back?" and "forwarded?"
 * clocks run. Quest and Labcorp use the provider's own account and she loses
 * all access at drop-off — chasing results there would be chasing something
 * she cannot see, so those encounters are skipped entirely.
 */
export function computeAlerts(rows: EncounterRow[]): Alert[] {
  const out: Alert[] = [];

  for (const e of rows) {
    if (e.status === "cancelled" || e.archived_at) continue;

    const tracksResults = e.lab?.is_reference_lab ?? false;

    if (tracksResults && !e.results_received) {
      const d = daysSince(e.date_of_service);
      if (d !== null && d >= ALERT_DAYS.results_overdue) {
        out.push({
          rule: "results_overdue",
          label: "Results not back yet",
          detail: `Collected ${d} days ago and ${e.lab?.name ?? "the lab"} has not returned results.`,
          daysOverdue: d,
          encounter: e,
        });
      }
    }

    if (tracksResults && e.results_received && !e.results_sent) {
      const d = daysSince(e.results_received_on ?? e.date_of_service);
      if (d !== null && d >= ALERT_DAYS.forward_overdue) {
        out.push({
          rule: "forward_overdue",
          label: "Results not forwarded",
          detail: `Results have been in for ${d} days and have not gone to ${
            e.practice?.name ?? e.ordering_provider ?? "the ordering practitioner"
          }.`,
          daysOverdue: d,
          encounter: e,
        });
      }
    }

    const owed = Number(e.amount_due ?? 0);
    const got = Number(e.amount_paid ?? 0);
    if (owed > 0 && got < owed) {
      const d = daysSince(e.date_of_service);
      if (d !== null && d >= ALERT_DAYS.payment_overdue) {
        out.push({
          rule: "payment_overdue",
          label: "Payment outstanding",
          detail: `$${(owed - got).toFixed(2)} still owed, ${d} days after the visit.`,
          daysOverdue: d,
          encounter: e,
        });
      }
    }
  }

  return out.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

/* ------------------------------------------------- alert-email de-duplication */

export const listSentAlerts = () =>
  list<{ encounter_id: string; rule: string }>("ll_alerts_sent?select=encounter_id,rule");

export const recordAlertSent = (encounterId: string, rule: AlertRule) =>
  insert("ll_alerts_sent", { encounter_id: encounterId, rule });

/**
 * Clear the "already nagged" marks for an encounter, so that if a step slips
 * again later it can alert again rather than staying permanently silent.
 */
export async function clearAlertMarks(encounterId: string, rules: AlertRule[]) {
  if (!trackingEnabled() || !rules.length) return;
  const inList = rules.map((r) => `"${r}"`).join(",");
  await rest(
    `ll_alerts_sent?encounter_id=eq.${encodeURIComponent(encounterId)}&rule=in.(${inList})`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } },
  ).catch((err) => console.error("[ll:clear-alerts-exception]", err));
}
