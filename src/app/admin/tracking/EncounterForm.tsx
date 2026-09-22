"use client";

import { useState } from "react";
import {
  PAYMENT_METHOD_LABEL,
  SEND_METHOD_LABEL,
  STATUS_LABEL,
  TEST_TYPE_OPTIONS,
  type Encounter,
  type EncounterStatus,
  type PaymentMethod,
  type Reference,
  type SendMethod,
} from "@/lib/tracking-types";
import { Field, buttonClass, inputClass, labelClass } from "../ui";

/**
 * Add / edit one collection.
 *
 * Mirrors the column order of the Google Doc this replaces, so Michelle can
 * read down it the way she already reads her sheet — but grouped into the
 * four things that are actually separate jobs: the visit, the lab, getting
 * results where they belong, and getting paid.
 *
 * There is no field for a result value anywhere on this form, by design.
 */

type Props = {
  reference: Reference;
  initial?: Encounter | null;
  onDone: () => void;
  onCancel: () => void;
};

const today = () => new Date().toISOString().slice(0, 10);

export default function EncounterForm({ reference, initial, onDone, onCancel }: Props) {
  const editing = Boolean(initial);

  const [patientName, setPatientName] = useState(initial?.patient_name ?? "");
  const [dob, setDob] = useState(initial?.patient_dob ?? "");
  const [dos, setDos] = useState(initial?.date_of_service ?? today());
  const [practiceId, setPracticeId] = useState(initial?.practice_id ?? "");
  const [otherProvider, setOtherProvider] = useState(initial?.ordering_provider ?? "");
  const [testTypes, setTestTypes] = useState<string[]>(initial?.test_types ?? []);
  const [labId, setLabId] = useState(initial?.lab_id ?? "");
  const [phlebId, setPhlebId] = useState(initial?.phlebotomist_id ?? "");

  const [resultsReceived, setResultsReceived] = useState(initial?.results_received ?? false);
  const [resultsReceivedOn, setResultsReceivedOn] = useState(initial?.results_received_on ?? "");
  const [resultsSent, setResultsSent] = useState(initial?.results_sent ?? false);
  const [resultsSentOn, setResultsSentOn] = useState(initial?.results_sent_on ?? "");
  const [resultsSentMethod, setResultsSentMethod] = useState<SendMethod | "">(
    initial?.results_sent_method ?? "",
  );

  const [sticksRequested, setSticksRequested] = useState(initial?.rl_sticks_requested ?? false);
  const [sticksPaid, setSticksPaid] = useState(initial?.rl_sticks_paid ?? false);
  const [insurancePaid, setInsurancePaid] = useState(initial?.rl_insurance_paid ?? false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initial?.payment_method ?? "none",
  );
  const [amountDue, setAmountDue] = useState(
    initial?.amount_due != null ? String(initial.amount_due) : "",
  );
  const [amountPaid, setAmountPaid] = useState(
    initial?.amount_paid != null ? String(initial.amount_paid) : "",
  );
  const [paidOn, setPaidOn] = useState(initial?.paid_on ?? "");

  const [status, setStatus] = useState<EncounterStatus>(initial?.status ?? "open");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lab = reference.labs.find((l) => l.id === labId) ?? null;
  // Quest and Labcorp run on the ordering provider's own account — Michelle
  // loses access the moment the specimen is delivered, so the whole
  // result-follow-up block is meaningless there and is hidden rather than
  // left to be filled in wrongly.
  const tracksResults = lab?.is_reference_lab ?? false;

  const toggleTest = (t: string) =>
    setTestTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientName.trim()) {
      setError("A patient name is needed.");
      return;
    }
    setBusy(true);
    setError(null);

    const payload = {
      patient_name: patientName.trim(),
      patient_dob: dob || null,
      date_of_service: dos || null,
      practice_id: practiceId || null,
      ordering_provider: otherProvider.trim() || null,
      test_types: testTypes,
      lab_id: labId || null,
      phlebotomist_id: phlebId || null,
      results_received: tracksResults ? resultsReceived : false,
      results_received_on: tracksResults && resultsReceived ? resultsReceivedOn || null : null,
      results_sent: tracksResults ? resultsSent : false,
      results_sent_on: tracksResults && resultsSent ? resultsSentOn || null : null,
      results_sent_method:
        tracksResults && resultsSent ? resultsSentMethod || null : null,
      rl_sticks_requested: sticksRequested,
      rl_sticks_paid: sticksPaid,
      rl_insurance_paid: insurancePaid,
      payment_method: paymentMethod,
      amount_due: amountDue === "" ? null : Number(amountDue),
      amount_paid: amountPaid === "" ? null : Number(amountPaid),
      paid_on: paidOn || null,
      status,
      notes: notes.trim() || null,
    };

    try {
      const res = await fetch(
        editing ? `/api/admin/encounters/${initial!.id}` : "/api/admin/encounters",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't save that. Try again.");
        return;
      }
      onDone();
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold tracking-wide text-brand-ink uppercase">
          The visit
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Patient name">
            <input
              className={inputClass}
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              autoFocus
              required
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              className={inputClass}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </Field>
          <Field label="Date of service">
            <input
              type="date"
              className={inputClass}
              value={dos}
              onChange={(e) => setDos(e.target.value)}
            />
          </Field>
          <Field label="Ordering practitioner">
            <select
              className={inputClass}
              value={practiceId}
              onChange={(e) => setPracticeId(e.target.value)}
            >
              <option value="">— select —</option>
              {reference.practices.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.organization && p.organization !== p.name ? ` · ${p.organization}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Or write one in"
            hint="For a doctor who isn't on the list yet."
          >
            <input
              className={inputClass}
              value={otherProvider}
              onChange={(e) => setOtherProvider(e.target.value)}
              placeholder="e.g. Dr. Smith"
            />
          </Field>
          <Field label="Who collected">
            <select
              className={inputClass}
              value={phlebId}
              onChange={(e) => setPhlebId(e.target.value)}
            >
              <option value="">— select —</option>
              {reference.phlebotomists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.initials})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div>
          <span className={labelClass}>What was collected</span>
          <span className="mt-0.5 block text-xs text-muted">
            The type of collection only. Results are never stored here.
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEST_TYPE_OPTIONS.map((t) => {
              const on = testTypes.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTest(t)}
                  aria-pressed={on}
                  className={`min-h-10 rounded-full px-3.5 text-sm font-semibold transition-colors ${
                    on
                      ? "bg-brand text-white"
                      : "bg-white text-muted ring-1 ring-inset ring-cream-deep hover:bg-cream"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold tracking-wide text-brand-ink uppercase">
          Where it went
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Laboratory">
            <select
              className={inputClass}
              value={labId}
              onChange={(e) => setLabId(e.target.value)}
            >
              <option value="">— select —</option>
              {reference.labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                  {l.is_reference_lab ? " (reference lab)" : ""}
                </option>
              ))}
            </select>
          </Field>
          {lab && !tracksResults && (
            <p className="self-end rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-900 ring-1 ring-inset ring-sky-200">
              {lab.name} uses the ordering provider&rsquo;s own account. Once the specimen is
              delivered there is nothing further to follow up, so the results steps below are
              hidden and this visit will never show up as overdue.
            </p>
          )}
        </div>
      </fieldset>

      {tracksResults && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-bold tracking-wide text-brand-ink uppercase">
            Results follow-up
          </legend>
          <p className="text-sm text-muted">
            {lab?.name} is a reference lab, so you have chart access and it is on you to get the
            results to the ordering practitioner. These are yes/no checkboxes — the results
            themselves stay in the lab&rsquo;s system.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Check
                label="Results are back"
                checked={resultsReceived}
                onChange={(v) => {
                  setResultsReceived(v);
                  if (v && !resultsReceivedOn) setResultsReceivedOn(today());
                }}
              />
              {resultsReceived && (
                <Field label="Came back on">
                  <input
                    type="date"
                    className={inputClass}
                    value={resultsReceivedOn}
                    onChange={(e) => setResultsReceivedOn(e.target.value)}
                  />
                </Field>
              )}
            </div>
            <div className="space-y-3">
              <Check
                label="Sent to the ordering practitioner"
                checked={resultsSent}
                onChange={(v) => {
                  setResultsSent(v);
                  if (v && !resultsSentOn) setResultsSentOn(today());
                }}
              />
              {resultsSent && (
                <>
                  <Field label="Sent on">
                    <input
                      type="date"
                      className={inputClass}
                      value={resultsSentOn}
                      onChange={(e) => setResultsSentOn(e.target.value)}
                    />
                  </Field>
                  <Field label="How they were sent">
                    <select
                      className={inputClass}
                      value={resultsSentMethod}
                      onChange={(e) => setResultsSentMethod(e.target.value as SendMethod | "")}
                    >
                      <option value="">— not recorded —</option>
                      {Object.entries(SEND_METHOD_LABEL).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              )}
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold tracking-wide text-brand-ink uppercase">
          Getting paid
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <Check label="Requested RL sticks" checked={sticksRequested} onChange={setSticksRequested} />
          <Check label="Paid for RL sticks" checked={sticksPaid} onChange={setSticksPaid} />
          <Check label="Paid — RL insurance" checked={insurancePaid} onChange={setInsurancePaid} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="How they paid">
            <select
              className={inputClass}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {Object.entries(PAYMENT_METHOD_LABEL).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Amount due" hint="Leave blank if nothing is owed to you.">
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              className={inputClass}
              value={amountDue}
              onChange={(e) => setAmountDue(e.target.value)}
            />
          </Field>
          <Field label="Amount paid">
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              className={inputClass}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
          </Field>
          <Field label="Paid on">
            <input
              type="date"
              className={inputClass}
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-bold tracking-wide text-brand-ink uppercase">
          Status &amp; notes
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <select
              className={inputClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as EncounterStatus)}
            >
              {Object.entries(STATUS_LABEL).map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Notes"
            hint="Process notes only — no results, readings or diagnoses."
            className="sm:col-span-2"
          >
            <textarea
              rows={3}
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Blood taken, coming back for urine sample"
            />
          </Field>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm font-semibold text-brand-ink">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-cream-deep pt-5">
        <button type="submit" disabled={busy} className={buttonClass.primary}>
          {busy ? "Saving…" : editing ? "Save changes" : "Add collection"}
        </button>
        <button type="button" onClick={onCancel} className={buttonClass.secondary}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 shrink-0 accent-[#de0f0d]"
      />
      <span className="text-sm font-semibold text-ink">{label}</span>
    </label>
  );
}
