"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PAYMENT_METHOD_LABEL,
  SEND_METHOD_LABEL,
  STATUS_LABEL,
  type EncounterStatus,
  type Encounter,
  type EncounterRow,
  type PaymentMethod,
  type Reference,
} from "@/lib/tracking-types";
import { Empty, Panel, Pill, YesNo, buttonClass, inputClass, money, shortDate } from "../ui";
import EncounterForm from "./EncounterForm";
import { InlineDate, InlineSelect, InlineText } from "./InlineFields";

/**
 * The board that replaces the Google Doc.
 *
 * Two renderings of the same rows: a wide table on desktop, laid out in the
 * column order Michelle already reads, and stacked cards on a phone — which
 * is where this actually gets used, between visits, in a car.
 *
 * Filtering and sorting are client-side. The whole working set is a few
 * hundred rows; a round trip per keystroke would be slower and worse.
 */

type Props = { rows: EncounterRow[]; reference: Reference };

type Tab = "all" | "needs_results" | "needs_sending" | "unpaid" | "complete";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All open" },
  { id: "needs_results", label: "Waiting on results" },
  { id: "needs_sending", label: "To send to the doctor" },
  { id: "unpaid", label: "Unpaid" },
  { id: "complete", label: "Complete" },
];

export default function TrackingBoard({ rows, reference }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [practice, setPractice] = useState("");
  const [lab, setLab] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Encounter | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  // Built once rather than per row: this renders inside every cell of a few
  // hundred rows.
  const practiceOptions = useMemo(
    () => reference.practices.map((p) => ({ value: p.id, label: p.name })),
    [reference.practices],
  );
  const labOptions = useMemo(
    () =>
      reference.labs.map((l) => ({
        value: l.id,
        label: l.is_reference_lab ? `${l.name} (ref)` : l.name,
      })),
    [reference.labs],
  );
  const phlebOptions = useMemo(
    () => reference.phlebotomists.map((p) => ({ value: p.id, label: p.initials })),
    [reference.phlebotomists],
  );
  const statusOptions = Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }));
  const paymentOptions = Object.entries(PAYMENT_METHOD_LABEL).map(([value, label]) => ({
    value,
    label,
  }));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return rows.filter((r) => {
      const tracks = r.lab?.is_reference_lab ?? false;
      const owed = Number(r.amount_due ?? 0);
      const got = Number(r.amount_paid ?? 0);

      if (tab === "all" && r.status === "complete") return false;
      if (tab === "complete" && r.status !== "complete") return false;
      if (tab === "needs_results" && !(tracks && !r.results_received)) return false;
      if (tab === "needs_sending" && !(tracks && r.results_received && !r.results_sent))
        return false;
      if (tab === "unpaid" && !(owed > 0 && got < owed)) return false;

      if (practice && r.practice_id !== practice) return false;
      if (lab && r.lab_id !== lab) return false;

      if (needle) {
        const hay = [
          r.patient_name,
          r.practice?.name,
          r.ordering_provider,
          r.lab?.name,
          r.phlebotomist?.initials,
          r.notes,
          ...r.test_types,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      return true;
    });
  }, [rows, tab, q, practice, lab]);

  /**
   * Save one field and refresh.
   *
   * Returns whether it worked so an inline field can put its old value back
   * on failure rather than showing something that isn't in the database.
   * Unlike `toggle` it does not grey the row — the field shows its own state,
   * and dimming the whole row on every keystroke-commit would flicker.
   */
  async function saveField(id: string, patch: Partial<Encounter>): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/encounters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) router.refresh();
      return res.ok;
    } catch {
      return false;
    }
  }

  /** Optimistic-free: flip the flag server-side, then let the page re-fetch. */
  async function toggle(row: EncounterRow, patch: Partial<Encounter>) {
    setPending(row.id);
    try {
      await fetch(`/api/admin/encounters/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function remove(row: EncounterRow) {
    if (
      !confirm(
        `Delete the record for ${row.patient_name}? This cannot be undone — use Archive if you only want it off the board.`,
      )
    )
      return;
    setPending(row.id);
    try {
      await fetch(`/api/admin/encounters/${row.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  if (adding || editing) {
    return (
      <Panel
        title={editing ? `Edit — ${editing.patient_name}` : "Add a collection"}
        className="p-5 sm:p-6"
      >
        <div className="pt-5">
          <EncounterForm
            reference={reference}
            initial={editing}
            onDone={() => {
              setAdding(false);
              setEditing(null);
              router.refresh();
            }}
            onCancel={() => {
              setAdding(false);
              setEditing(null);
            }}
          />
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`min-h-11 rounded-lg px-3.5 text-sm font-bold transition-colors ${
              tab === t.id
                ? "bg-brand text-white"
                : "bg-white text-muted ring-1 ring-inset ring-cream-deep hover:bg-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          <a href="/api/admin/export" className={buttonClass.secondary}>
            Export CSV
          </a>
          <button type="button" onClick={() => setAdding(true)} className={buttonClass.primary}>
            + Add collection
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          className={inputClass}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a patient, doctor, lab or note…"
          type="search"
        />
        <select
          className={inputClass}
          value={practice}
          onChange={(e) => setPractice(e.target.value)}
          aria-label="Filter by ordering practitioner"
        >
          <option value="">All practitioners</option>
          {reference.practices.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={lab}
          onChange={(e) => setLab(e.target.value)}
          aria-label="Filter by laboratory"
        >
          <option value="">All labs</option>
          {reference.labs.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <Panel>
        <p className="border-b border-cream-deep px-5 py-3 text-sm text-muted">
          {filtered.length} {filtered.length === 1 ? "collection" : "collections"}
          {filtered.length !== rows.length && ` of ${rows.length}`}
        </p>

        {filtered.length === 0 ? (
          <Empty>
            Nothing here.{" "}
            {rows.length === 0
              ? "Add your first collection to get started."
              : "Try a different tab or clear the filters."}
          </Empty>
        ) : (
          <>
            {/* Desktop: the sheet, in her column order. */}
            <p className="hidden px-5 pb-2 text-xs text-muted xl:block">
              Every cell is editable — click a date, a dropdown or a note and it saves itself.
              Scroll sideways for payment and notes; the patient name stays put.
            </p>
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[1500px] text-sm">
                <thead>
                  <tr className="border-b border-cream-deep text-left text-xs tracking-wide text-muted uppercase">
                    <Th sticky>Patient</Th>
                    <Th>DOB</Th>
                    <Th>Service</Th>
                    <Th>Ordering practitioner</Th>
                    <Th>Collected</Th>
                    <Th>Lab</Th>
                    <Th center>Results in</Th>
                    <Th center>Sent to MD</Th>
                    <Th center title="Request RL sticks">Req.</Th>
                    <Th center title="Paid for RL sticks">Sticks $</Th>
                    <Th center title="Paid — RL insurance">Ins. $</Th>
                    <Th>Payment</Th>
                    <Th>By</Th>
                    <Th>Notes</Th>
                    <Th> </Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const tracks = r.lab?.is_reference_lab ?? false;
                    const busy = pending === r.id;
                    return (
                      <tr
                        key={r.id}
                        className={`border-b border-cream-deep/70 align-top last:border-0 ${
                          busy ? "opacity-50" : ""
                        }`}
                      >
                        <Td sticky className="min-w-[9.5rem]">
                          <InlineText
                            value={r.patient_name}
                            className="font-semibold"
                            onSave={(v) =>
                              // Never let the name be cleared — it is the one
                              // thing that makes a row findable.
                              v ? saveField(r.id, { patient_name: v }) : Promise.resolve(false)
                            }
                          />
                          <span className="mt-1 block">
                            <InlineSelect
                              value={r.status}
                              options={statusOptions}
                              allowEmpty={false}
                              className="text-xs"
                              onSave={(v) =>
                                saveField(r.id, {
                                  status: (v ?? "open") as EncounterStatus,
                                })
                              }
                            />
                          </span>
                        </Td>
                        <Td className="min-w-[7.75rem]">
                          <InlineDate
                            value={r.patient_dob}
                            onSave={(v) => saveField(r.id, { patient_dob: v })}
                          />
                        </Td>
                        <Td className="min-w-[7.75rem]">
                          <InlineDate
                            value={r.date_of_service}
                            onSave={(v) => saveField(r.id, { date_of_service: v })}
                          />
                        </Td>
                        <Td className="min-w-[9.5rem]">
                          <InlineSelect
                            value={r.practice_id}
                            options={practiceOptions}
                            onSave={(v) => saveField(r.id, { practice_id: v })}
                          />
                          {!r.practice_id && r.ordering_provider && (
                            <span className="block px-1.5 text-xs text-muted">
                              {r.ordering_provider}
                            </span>
                          )}
                        </Td>
                        <Td className="max-w-[9rem]">
                          {r.test_types.length ? (
                            <span className="text-muted">{r.test_types.join(", ")}</span>
                          ) : (
                            <span className="text-muted/60">—</span>
                          )}
                        </Td>
                        <Td className="min-w-[8.5rem]">
                          <InlineSelect
                            value={r.lab_id}
                            options={labOptions}
                            onSave={(v) => saveField(r.id, { lab_id: v })}
                          />
                          {r.lab && !tracks && (
                            <span
                              className="block px-1.5 text-xs text-muted"
                              title="Ordering provider's own account — no access after drop-off"
                            >
                              their account
                            </span>
                          )}
                        </Td>
                        <TdC>
                          <Toggle
                            on={r.results_received}
                            na={!tracks}
                            busy={busy}
                            onClick={() =>
                              toggle(r, {
                                results_received: !r.results_received,
                                results_received_on: !r.results_received
                                  ? new Date().toISOString().slice(0, 10)
                                  : null,
                              })
                            }
                          />
                        </TdC>
                        <TdC>
                          <Toggle
                            on={r.results_sent}
                            na={!tracks}
                            busy={busy}
                            onClick={() =>
                              toggle(r, {
                                results_sent: !r.results_sent,
                                results_sent_on: !r.results_sent
                                  ? new Date().toISOString().slice(0, 10)
                                  : null,
                              })
                            }
                          />
                          {r.results_sent && r.results_sent_method && (
                            <span className="mt-0.5 block text-xs text-muted">
                              {SEND_METHOD_LABEL[r.results_sent_method]}
                              {r.results_sent_on ? ` ${shortDate(r.results_sent_on)}` : ""}
                            </span>
                          )}
                        </TdC>
                        <TdC>
                          <Toggle
                            on={r.rl_sticks_requested}
                            busy={busy}
                            onClick={() =>
                              toggle(r, { rl_sticks_requested: !r.rl_sticks_requested })
                            }
                          />
                        </TdC>
                        <TdC>
                          <Toggle
                            on={r.rl_sticks_paid}
                            busy={busy}
                            onClick={() => toggle(r, { rl_sticks_paid: !r.rl_sticks_paid })}
                          />
                        </TdC>
                        <TdC>
                          <Toggle
                            on={r.rl_insurance_paid}
                            busy={busy}
                            onClick={() => toggle(r, { rl_insurance_paid: !r.rl_insurance_paid })}
                          />
                        </TdC>
                        <Td className="min-w-[10rem]">
                          <span className="flex gap-1">
                            <InlineText
                              value={r.amount_paid}
                              numeric
                              prefix="$"
                              placeholder="paid"
                              onSave={(v) =>
                                saveField(r.id, { amount_paid: v === null ? null : Number(v) })
                              }
                            />
                            <span className="self-center text-xs text-muted">of</span>
                            <InlineText
                              value={r.amount_due}
                              numeric
                              prefix="$"
                              placeholder="due"
                              onSave={(v) =>
                                saveField(r.id, { amount_due: v === null ? null : Number(v) })
                              }
                            />
                          </span>
                          <InlineSelect
                            value={r.payment_method}
                            options={paymentOptions}
                            allowEmpty={false}
                            className="text-xs"
                            onSave={(v) =>
                              saveField(r.id, {
                                payment_method: (v ?? "none") as PaymentMethod,
                              })
                            }
                          />
                          <OwedPill row={r} />
                        </Td>
                        <Td className="min-w-[5.5rem]">
                          <InlineSelect
                            value={r.phlebotomist_id}
                            options={phlebOptions}
                            onSave={(v) => saveField(r.id, { phlebotomist_id: v })}
                          />
                        </Td>
                        <Td className="min-w-[12rem]">
                          <InlineText
                            value={r.notes}
                            multiline
                            placeholder="Add a note…"
                            className="text-muted"
                            onSave={(v) => saveField(r.id, { notes: v })}
                          />
                        </Td>
                        <Td>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setEditing(r)}
                              className="rounded px-2 py-1 text-xs font-bold text-brand-ink hover:bg-cream"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(r)}
                              className="rounded px-2 py-1 text-xs font-bold text-muted hover:bg-cream"
                            >
                              Delete
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phone and tablet: one card per collection. */}
            <ul className="divide-y divide-cream-deep xl:hidden">
              {filtered.map((r) => {
                const tracks = r.lab?.is_reference_lab ?? false;
                const busy = pending === r.id;
                return (
                  <li key={r.id} className={`p-5 ${busy ? "opacity-50" : ""}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-base font-bold text-ink">{r.patient_name}</p>
                      <Pill tone={r.status === "complete" ? "good" : "neutral"}>
                        {STATUS_LABEL[r.status]}
                      </Pill>
                    </div>

                    {/*
                      The same edit-in-place fields as the desktop table. She
                      does most of this on a phone between visits, so "fix the
                      date without opening anything" has to work here too.
                    */}
                    <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                      <Ke k="Date of birth">
                        <InlineDate
                          value={r.patient_dob}
                          onSave={(v) => saveField(r.id, { patient_dob: v })}
                        />
                      </Ke>
                      <Ke k="Date of service">
                        <InlineDate
                          value={r.date_of_service}
                          onSave={(v) => saveField(r.id, { date_of_service: v })}
                        />
                      </Ke>
                      <Ke k="Practitioner">
                        <InlineSelect
                          value={r.practice_id}
                          options={practiceOptions}
                          onSave={(v) => saveField(r.id, { practice_id: v })}
                        />
                      </Ke>
                      <Ke k="Lab">
                        <InlineSelect
                          value={r.lab_id}
                          options={labOptions}
                          onSave={(v) => saveField(r.id, { lab_id: v })}
                        />
                      </Ke>
                      <Ke k="Who collected">
                        <InlineSelect
                          value={r.phlebotomist_id}
                          options={phlebOptions}
                          onSave={(v) => saveField(r.id, { phlebotomist_id: v })}
                        />
                      </Ke>
                      <Ke k="Status">
                        <InlineSelect
                          value={r.status}
                          options={statusOptions}
                          allowEmpty={false}
                          onSave={(v) =>
                            saveField(r.id, { status: (v ?? "open") as EncounterStatus })
                          }
                        />
                      </Ke>
                      <div className="col-span-2">
                        <dt className="text-xs tracking-wide text-muted uppercase">Collected</dt>
                        <dd className="font-semibold text-ink">
                          {r.test_types.join(", ") || "—"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {tracks ? (
                        <>
                          <TapFlag
                            label="Results in"
                            on={r.results_received}
                            busy={busy}
                            onClick={() =>
                              toggle(r, {
                                results_received: !r.results_received,
                                results_received_on: !r.results_received
                                  ? new Date().toISOString().slice(0, 10)
                                  : null,
                              })
                            }
                          />
                          <TapFlag
                            label="Sent to MD"
                            on={r.results_sent}
                            busy={busy}
                            onClick={() =>
                              toggle(r, {
                                results_sent: !r.results_sent,
                                results_sent_on: !r.results_sent
                                  ? new Date().toISOString().slice(0, 10)
                                  : null,
                              })
                            }
                          />
                        </>
                      ) : (
                        r.lab && (
                          <Pill tone="info">
                            {r.lab.name} — their account, no follow-up
                          </Pill>
                        )
                      )}
                      <TapFlag
                        label="Sticks req."
                        on={r.rl_sticks_requested}
                        busy={busy}
                        onClick={() => toggle(r, { rl_sticks_requested: !r.rl_sticks_requested })}
                      />
                      <TapFlag
                        label="Sticks paid"
                        on={r.rl_sticks_paid}
                        busy={busy}
                        onClick={() => toggle(r, { rl_sticks_paid: !r.rl_sticks_paid })}
                      />
                      <TapFlag
                        label="Ins. paid"
                        on={r.rl_insurance_paid}
                        busy={busy}
                        onClick={() => toggle(r, { rl_insurance_paid: !r.rl_insurance_paid })}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                      <Ke k="Paid">
                        <InlineText
                          value={r.amount_paid}
                          numeric
                          prefix="$"
                          placeholder="—"
                          onSave={(v) =>
                            saveField(r.id, { amount_paid: v === null ? null : Number(v) })
                          }
                        />
                      </Ke>
                      <Ke k="Due">
                        <InlineText
                          value={r.amount_due}
                          numeric
                          prefix="$"
                          placeholder="—"
                          onSave={(v) =>
                            saveField(r.id, { amount_due: v === null ? null : Number(v) })
                          }
                        />
                      </Ke>
                      <div className="col-span-2">
                        <dt className="text-xs tracking-wide text-muted uppercase">
                          How they paid
                        </dt>
                        <dd>
                          <InlineSelect
                            value={r.payment_method}
                            options={paymentOptions}
                            allowEmpty={false}
                            onSave={(v) =>
                              saveField(r.id, {
                                payment_method: (v ?? "none") as PaymentMethod,
                              })
                            }
                          />
                        </dd>
                      </div>
                    </div>
                    <OwedPill row={r} />

                    <div className="mt-3">
                      <InlineText
                        value={r.notes}
                        multiline
                        placeholder="Add a note…"
                        className="text-muted"
                        onSave={(v) => saveField(r.id, { notes: v })}
                      />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(r)}
                        className={buttonClass.secondary}
                      >
                        Full form
                      </button>
                      <button type="button" onClick={() => remove(r)} className={buttonClass.quiet}>
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ bits */

function Th({
  children,
  center,
  title,
  sticky = false,
}: {
  children: React.ReactNode;
  center?: boolean;
  title?: string;
  sticky?: boolean;
}) {
  return (
    <th
      scope="col"
      title={title}
      className={`px-3 py-3 font-bold ${center ? "text-center" : ""} ${
        sticky ? "sticky left-0 z-10 bg-white shadow-[1px_0_0_0_var(--color-cream-deep)]" : ""
      }`}
    >
      {children}
    </th>
  );
}

const Td = ({
  children,
  className = "",
  sticky = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Pins the cell while the table scrolls sideways. Patient column only. */
  sticky?: boolean;
}) => (
  <td
    className={`px-3 py-3 ${
      sticky ? "sticky left-0 z-10 bg-white shadow-[1px_0_0_0_var(--color-cream-deep)]" : ""
    } ${className}`}
  >
    {children}
  </td>
);

const TdC = ({ children }: { children: React.ReactNode }) => (
  <td className="px-3 py-3 text-center">{children}</td>
);

/** A labelled slot on the phone card holding an edit-in-place field. */
const Ke = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <div>
    <dt className="text-xs tracking-wide text-muted uppercase">{k}</dt>
    <dd className="mt-0.5">{children}</dd>
  </div>
);

/** A Y/N cell you can click to flip, or a dash when the step doesn't apply. */
function Toggle({
  on,
  na = false,
  busy,
  onClick,
}: {
  on: boolean;
  na?: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  if (na) return <YesNo value={false} na />;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={on}
      title={on ? "Click to mark as not done" : "Click to mark as done"}
      className="min-h-9 min-w-9 rounded-lg text-base hover:bg-cream disabled:cursor-wait"
    >
      <YesNo value={on} />
    </button>
  );
}

function TapFlag({
  label,
  on,
  busy,
  onClick,
}: {
  label: string;
  on: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={on}
      className={`min-h-10 rounded-full px-3.5 text-sm font-semibold transition-colors disabled:cursor-wait ${
        on
          ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
          : "bg-white text-muted ring-1 ring-inset ring-cream-deep"
      }`}
    >
      {on ? "✓ " : ""}
      {label}
    </button>
  );
}

/** Just the outstanding-balance badge, for the desktop row. */
function OwedPill({ row }: { row: EncounterRow }) {
  const due = Number(row.amount_due ?? 0);
  const paid = Number(row.amount_paid ?? 0);
  if (due <= 0) return null;
  return (
    <span className="mt-1 block px-1.5">
      {paid < due ? (
        <Pill tone="warn">{money(due - paid)} owed</Pill>
      ) : (
        <Pill tone="good">Paid</Pill>
      )}
    </span>
  );
}
