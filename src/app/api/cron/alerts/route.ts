import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin-auth";
import { escapeHtml, sendMail, shell } from "@/lib/mail";
import {
  computeAlerts,
  listEncounterRows,
  listSentAlerts,
  logActivity,
  recordAlertSent,
} from "@/lib/tracking";
import type { AlertRule } from "@/lib/tracking-types";

export const dynamic = "force-dynamic";

/**
 * The nightly "nothing has happened in a week" email Michelle asked for.
 *
 * Runs from the Vercel cron in vercel.json. Deliberately only ever mails
 * about an encounter/rule pair once: ll_alerts_sent records what has already
 * gone out, and completing the step clears the mark so a later stall can
 * alert again. Without that this becomes a daily repeat of the same names and
 * she stops reading it.
 *
 * The email lists patient names and what is outstanding. It never contains a
 * test result, because the system it reads from has nowhere to store one.
 */

/** Vercel signs cron requests with CRON_SECRET; a signed-in admin may also fire it by hand. */
async function authorised(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return isAuthed();
}

export async function GET(req: Request) {
  if (!(await authorised(req))) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const to = process.env.ALERT_EMAIL_TO;
  if (!to) return NextResponse.json({ ok: true, skipped: "ALERT_EMAIL_TO is not set" });

  const { rows } = await listEncounterRows();
  const alerts = computeAlerts(rows);

  const already = new Set((await listSentAlerts()).map((a) => `${a.encounter_id}:${a.rule}`));
  const fresh = alerts.filter((a) => !already.has(`${a.encounter.id}:${a.rule}`));

  if (!fresh.length) {
    return NextResponse.json({ ok: true, alerts: alerts.length, sent: 0 });
  }

  const groups: Record<AlertRule, typeof fresh> = {
    results_overdue: [],
    forward_overdue: [],
    payment_overdue: [],
  };
  for (const a of fresh) groups[a.rule].push(a);

  const headings: Record<AlertRule, string> = {
    results_overdue: "Results still not back",
    forward_overdue: "Results in, but not yet sent to the practitioner",
    payment_overdue: "Payment still outstanding",
  };

  const body = (Object.keys(groups) as AlertRule[])
    .filter((rule) => groups[rule].length)
    .map(
      (rule) => `
      <h2 style="margin:22px 0 8px;font-size:15px;color:#8e0906">
        ${escapeHtml(headings[rule])} (${groups[rule].length})
      </h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${groups[rule]
          .map(
            (a) => `<tr>
              <td style="padding:8px 12px 8px 0;vertical-align:top;border-top:1px solid #f6ead6">
                <strong style="color:#1a1512">${escapeHtml(a.encounter.patient_name)}</strong><br>
                <span style="color:#5b5450">${escapeHtml(a.detail)}</span>
              </td>
              <td style="padding:8px 0;vertical-align:top;border-top:1px solid #f6ead6;white-space:nowrap;color:#5b5450">
                ${escapeHtml(a.encounter.date_of_service ?? "")}
              </td>
            </tr>`,
          )
          .join("")}
      </table>`,
    )
    .join("");

  const result = await sendMail({
    to,
    subject: `Lab Ladies — ${fresh.length} ${fresh.length === 1 ? "item needs" : "items need"} attention`,
    logAs: "ll-alerts",
    html: shell({
      heading: `${fresh.length} ${fresh.length === 1 ? "thing has" : "things have"} been waiting too long`,
      intro:
        "These are new since the last alert. You will only be emailed about each one once — open the tracking board to clear them.",
      body,
    }),
  });

  // Only mark as sent if it actually went out; a failed send should retry
  // tomorrow rather than silently swallowing the reminder.
  if (result === "sent") {
    await Promise.all(fresh.map((a) => recordAlertSent(a.encounter.id, a.rule)));
    await logActivity("alert", null, "email", `Emailed ${fresh.length} overdue items.`);
  }

  return NextResponse.json({ ok: true, alerts: alerts.length, sent: fresh.length, result });
}
