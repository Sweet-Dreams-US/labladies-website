import { requireAdmin } from "@/lib/admin-route";
import { listEncounterRows, logActivity } from "@/lib/tracking";
import { PAYMENT_METHOD_LABEL, SEND_METHOD_LABEL, STATUS_LABEL } from "@/lib/tracking-types";

/**
 * CSV of the whole board, in the Google Doc's column order.
 *
 * Michelle came from a spreadsheet and should be able to get back to one
 * whenever she wants — for her accountant, or just to feel she still owns her
 * data. Same scope rule as everywhere else: types and flags, never results.
 */

const YN = (b: boolean) => (b ? "Y" : "N");

/** RFC 4180 quoting, plus the leading-quote guard against formula injection. */
function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { rows } = await listEncounterRows({ includeArchived: true });

  const header = [
    "Patient Name",
    "Date of Birth",
    "Date of Service",
    "Ordering Practitioner",
    "What Was Collected",
    "Laboratory",
    "Reference Lab",
    "Results In",
    "Results In On",
    "Results Sent to Practitioner",
    "Results Sent On",
    "How Sent",
    "Request RL Sticks",
    "Paid for RL Sticks",
    "Paid - RL Insurance",
    "Payment Method",
    "Amount Due",
    "Amount Paid",
    "Paid On",
    "Phlebotomist",
    "Status",
    "Notes",
  ];

  const body = rows.map((r) =>
    [
      r.patient_name,
      r.patient_dob,
      r.date_of_service,
      r.practice?.name ?? r.ordering_provider,
      r.test_types.join("; "),
      r.lab?.name,
      r.lab ? YN(r.lab.is_reference_lab) : "",
      YN(r.results_received),
      r.results_received_on,
      YN(r.results_sent),
      r.results_sent_on,
      r.results_sent_method ? SEND_METHOD_LABEL[r.results_sent_method] : "",
      YN(r.rl_sticks_requested),
      YN(r.rl_sticks_paid),
      YN(r.rl_insurance_paid),
      PAYMENT_METHOD_LABEL[r.payment_method],
      r.amount_due,
      r.amount_paid,
      r.paid_on,
      r.phlebotomist?.initials,
      STATUS_LABEL[r.status],
      r.notes,
    ]
      .map(cell)
      .join(","),
  );

  await logActivity("encounter", null, "export", `Exported ${rows.length} rows to CSV.`);

  const stamp = new Date().toISOString().slice(0, 10);
  // The BOM is what makes Excel open this as UTF-8 rather than mangling it.
  return new Response(`﻿${[header.map(cell).join(","), ...body].join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lab-ladies-tracking-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
