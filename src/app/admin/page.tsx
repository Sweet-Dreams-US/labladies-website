import Link from "next/link";
import { computeAlerts, computeInquiryAlerts, listEncounterRows } from "@/lib/tracking";
import { listInquiries } from "@/lib/inquiries";
import { ALERT_DAYS } from "@/lib/tracking-types";
import { adminGate } from "./gate";
import { Empty, Panel, Pill, buttonClass, money, shortDate } from "./ui";

export const dynamic = "force-dynamic";

/**
 * The dashboard answers the question Michelle actually opens this with: what
 * has fallen through a crack? Alerts first, counts second. The same rules run
 * here and in the nightly email, so the board never disagrees with the inbox.
 */
export default async function AdminHome() {
  const blocked = await adminGate();
  if (blocked) return blocked;

  const [{ rows }, inquiries] = await Promise.all([listEncounterRows(), listInquiries()]);

  // All four rules land in one list, newest pain first, so the page answers
  // "what needs me" rather than "what kind of thing needs me".
  const alerts = [...computeAlerts(rows), ...computeInquiryAlerts(inquiries)].sort(
    (a, b) => b.daysOverdue - a.daysOverdue,
  );

  const newInquiries = inquiries.filter((i) => i.status === "new");

  const open = rows.filter((r) => r.status === "open");
  const awaitingResults = rows.filter(
    (r) => r.lab?.is_reference_lab && !r.results_received && r.status !== "cancelled",
  );
  const toForward = rows.filter(
    (r) => r.lab?.is_reference_lab && r.results_received && !r.results_sent,
  );
  const outstanding = rows.filter(
    (r) => Number(r.amount_due ?? 0) > Number(r.amount_paid ?? 0),
  );
  const owed = outstanding.reduce(
    (sum, r) => sum + (Number(r.amount_due ?? 0) - Number(r.amount_paid ?? 0)),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Today at a glance
          </h1>
          <p className="mt-1 text-muted">What needs chasing, and what you are owed.</p>
        </div>
        <Link href="/admin/tracking" className={buttonClass.primary}>
          Open the tracking board
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="New inquiries" value={newInquiries.length} href="/admin/inquiries" />
        <Stat label="Open collections" value={open.length} href="/admin/tracking" />
        <Stat label="Waiting on results" value={awaitingResults.length} href="/admin/tracking" />
        <Stat label="To send to the doctor" value={toForward.length} href="/admin/tracking" />
        <Stat label="Outstanding" value={money(owed)} href="/admin/tracking" />
      </div>

      <Panel
        title={
          alerts.length
            ? `${alerts.length} ${alerts.length === 1 ? "thing needs" : "things need"} attention`
            : "Nothing overdue"
        }
        description={`Flagged after ${ALERT_DAYS.inquiry_uncontacted} day without calling an inquiry back, ${ALERT_DAYS.results_overdue} days with no results, ${ALERT_DAYS.forward_overdue} days without forwarding them, or ${ALERT_DAYS.payment_overdue} days unpaid.`}
      >
        {alerts.length === 0 ? (
          <Empty>Everything is on track. Nothing has been sitting too long.</Empty>
        ) : (
          <ul className="divide-y divide-cream-deep">
            {alerts.map((a) => (
              <li
                key={`${a.rule}-${a.entityId}`}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink">{a.subject}</span>
                    <Pill tone={a.rule === "payment_overdue" ? "warn" : "bad"}>{a.label}</Pill>
                  </div>
                  <p className="mt-1 text-sm text-muted">{a.detail}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {a.encounter ? (
                      <>
                        Service {shortDate(a.encounter.date_of_service)}
                        {a.encounter.lab && ` · ${a.encounter.lab.name}`}
                        {a.encounter.practice && ` · ${a.encounter.practice.name}`}
                      </>
                    ) : (
                      <>Came in {shortDate(a.when)}</>
                    )}
                  </p>
                </div>
                <Link
                  href={a.encounter ? "/admin/tracking" : "/admin/inquiries"}
                  className={buttonClass.secondary}
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-cream-deep bg-white p-5 shadow-sm transition-colors hover:border-brand/40"
    >
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{value}</p>
    </Link>
  );
}
