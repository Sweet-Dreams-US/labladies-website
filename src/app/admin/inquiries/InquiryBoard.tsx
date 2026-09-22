"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  INQUIRY_FLOW,
  INQUIRY_STATUS_HINT,
  INQUIRY_STATUS_LABEL,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/inquiry-types";
import { Empty, Panel, Pill, buttonClass, inputClass } from "../ui";

/**
 * Inquiries from the website form.
 *
 * Built around one action: move it along the pipeline without opening
 * anything. The status buttons sit directly on the card, and the phone number
 * is a tap-to-call link — on Michelle's phone, "call them, then tap
 * Contacted" is two taps total.
 *
 * Marking Contacted stamps contacted_at automatically. She should not have to
 * tell the system what time it is.
 */

type Props = { rows: Inquiry[] };

type Tab = "open" | "new" | "all" | "spam";

const TABS: { id: Tab; label: string }[] = [
  { id: "open", label: "Needs action" },
  { id: "new", label: "New" },
  { id: "all", label: "All" },
  { id: "spam", label: "Spam" },
];

const toneFor = (s: InquiryStatus) =>
  s === "new" ? "bad" : s === "contacted" ? "warn" : s === "spam" ? "neutral" : "good";

export default function InquiryBoard({ rows }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("open");
  const [q, setQ] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === "spam" && r.status !== "spam") return false;
      if (tab !== "spam" && r.status === "spam") return false;
      if (tab === "new" && r.status !== "new") return false;
      if (tab === "open" && !["new", "contacted", "scheduled"].includes(r.status)) return false;

      if (needle) {
        const hay = [r.name, r.phone, r.email, r.area, r.service, r.message, r.admin_notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, tab, q]);

  async function patch(id: string, body: Record<string, unknown>) {
    setPending(id);
    try {
      await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  function setStatus(row: Inquiry, status: InquiryStatus) {
    // Stamp the first time it is marked contacted, and don't overwrite it if
    // she moves it back and forth afterwards.
    const stamp =
      status !== "new" && !row.contacted_at ? { contacted_at: new Date().toISOString() } : {};
    patch(row.id, { status, ...stamp });
  }

  async function remove(row: Inquiry) {
    if (!confirm(`Delete the inquiry from ${row.name}? This cannot be undone.`)) return;
    setPending(row.id);
    try {
      await fetch(`/api/admin/inquiries/${row.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  function saveNote(row: Inquiry) {
    patch(row.id, { admin_notes: noteDraft.trim() || null });
    setNoteFor(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const count =
            t.id === "new"
              ? rows.filter((r) => r.status === "new").length
              : t.id === "open"
                ? rows.filter((r) => ["new", "contacted", "scheduled"].includes(r.status)).length
                : null;
          return (
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
              {count ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      <input
        className={inputClass}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a name, number, area or note…"
      />

      <Panel>
        <p className="border-b border-cream-deep px-5 py-3 text-sm text-muted">
          {filtered.length} {filtered.length === 1 ? "inquiry" : "inquiries"}
        </p>

        {filtered.length === 0 ? (
          <Empty>
            {rows.length === 0
              ? "No inquiries yet. They will appear here the moment someone uses the form on the website."
              : "Nothing in this tab."}
          </Empty>
        ) : (
          <ul className="divide-y divide-cream-deep">
            {filtered.map((r) => {
              const busy = pending === r.id;
              return (
                <li key={r.id} className={`p-5 ${busy ? "opacity-50" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-ink">{r.name}</span>
                        <Pill tone={toneFor(r.status)}>{INQUIRY_STATUS_LABEL[r.status]}</Pill>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        <ReceivedAt iso={r.created_at} />
                        {r.service && ` · ${r.service}`}
                        {r.area && ` · ${r.area}`}
                        {r.inquiry_for && ` · for ${r.inquiry_for}`}
                      </p>
                    </div>

                    {/* Reach them. On a phone these are one tap each. */}
                    <div className="flex flex-wrap gap-2">
                      {r.phone && (
                        <>
                          <a
                            href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}
                            className={buttonClass.primary}
                          >
                            Call {r.phone}
                          </a>
                          <a
                            href={`sms:${r.phone.replace(/[^\d+]/g, "")}`}
                            className={buttonClass.secondary}
                          >
                            Text
                          </a>
                        </>
                      )}
                      {r.email && (
                        <a href={`mailto:${r.email}`} className={buttonClass.secondary}>
                          Email
                        </a>
                      )}
                    </div>
                  </div>

                  {r.prefer && (
                    <p className="mt-2 text-sm text-muted">
                      Prefers <strong className="text-ink">{r.prefer.toLowerCase()}</strong>
                      {r.email && r.phone ? ` · ${r.email}` : ""}
                    </p>
                  )}

                  {r.message && (
                    <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm leading-relaxed text-ink">
                      {r.message}
                    </p>
                  )}

                  {/* The pipeline, as buttons. No form to open. */}
                  <div className="mt-4">
                    <p className="text-xs font-bold tracking-wide text-muted uppercase">
                      Mark as
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {INQUIRY_FLOW.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={busy}
                          onClick={() => setStatus(r, s)}
                          aria-pressed={r.status === s}
                          title={INQUIRY_STATUS_HINT[s]}
                          className={`min-h-10 rounded-full px-3.5 text-sm font-semibold transition-colors disabled:cursor-wait ${
                            r.status === s
                              ? "bg-brand text-white"
                              : "bg-white text-muted ring-1 ring-inset ring-cream-deep hover:bg-cream hover:text-ink"
                          }`}
                        >
                          {r.status === s ? "✓ " : ""}
                          {INQUIRY_STATUS_LABEL[s]}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setStatus(r, "spam")}
                        className="min-h-10 rounded-full px-3.5 text-sm font-semibold text-muted hover:bg-cream disabled:cursor-wait"
                      >
                        Spam
                      </button>
                    </div>
                  </div>

                  {noteFor === r.id ? (
                    <div className="mt-4">
                      <textarea
                        rows={3}
                        autoFocus
                        className={inputClass}
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="e.g. Left a voicemail, calling back Thursday"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveNote(r)}
                          className={buttonClass.primary}
                        >
                          Save note
                        </button>
                        <button
                          type="button"
                          onClick={() => setNoteFor(null)}
                          className={buttonClass.secondary}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {r.admin_notes && (
                        <span className="text-sm text-muted italic">{r.admin_notes}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setNoteFor(r.id);
                          setNoteDraft(r.admin_notes ?? "");
                        }}
                        className="text-sm font-bold text-brand-ink hover:underline"
                      >
                        {r.admin_notes ? "Edit note" : "Add a note"}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r)}
                        className="text-sm font-bold text-muted hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function relativeTime(iso: string, now: number) {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const mins = Math.max(0, Math.round((now - then) / 60000));

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) {
    const h = Math.round(mins / 60);
    return `${h} ${h === 1 ? "hour" : "hours"} ago`;
  }
  const d = Math.round(mins / (60 * 24));
  return `${d} ${d === 1 ? "day" : "days"} ago`;
}

/**
 * The wall clock, as an external store.
 *
 * One interval for the whole page rather than one per row, and reading it
 * through useSyncExternalStore is what keeps the time out of render: the
 * server snapshot is null, so the first paint shows the absolute date and the
 * relative text appears once mounted. That avoids both the hydration mismatch
 * and the cascading re-render an effect-plus-setState would cause.
 */
const clock = {
  listeners: new Set<() => void>(),
  timer: null as ReturnType<typeof setInterval> | null,
  now: 0,
  subscribe(fn: () => void) {
    clock.listeners.add(fn);
    if (!clock.timer) {
      clock.now = Date.now();
      clock.timer = setInterval(() => {
        clock.now = Date.now();
        clock.listeners.forEach((l) => l());
      }, 60_000);
    }
    return () => {
      clock.listeners.delete(fn);
      if (clock.listeners.size === 0 && clock.timer) {
        clearInterval(clock.timer);
        clock.timer = null;
      }
    };
  },
  // A stable snapshot between ticks: returning Date.now() here would give a
  // new value on every read and loop forever.
  getSnapshot: () => clock.now || (clock.now = Date.now()),
  getServerSnapshot: () => 0,
};

/** "3 hours ago" beats a timestamp when the whole point is how long it sat. */
function ReceivedAt({ iso }: { iso: string }) {
  const now = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getServerSnapshot);

  return (
    <time dateTime={iso} title={new Date(iso).toLocaleString("en-US")}>
      {now ? relativeTime(iso, now) : new Date(iso).toLocaleDateString("en-US")}
    </time>
  );
}
