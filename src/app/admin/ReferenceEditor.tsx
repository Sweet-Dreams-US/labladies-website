"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Empty, Panel, Pill, buttonClass, inputClass } from "./ui";

/**
 * One editor for all three reference lists — practices, labs and team.
 *
 * They differ only in which fields they carry, so they are described as a
 * field spec rather than written out three times. Anything more elaborate
 * would be a form library for what is, in total, about thirty rows of data.
 */

export type FieldSpec =
  | { key: string; label: string; type: "text" | "email" | "tel" | "number"; hint?: string; placeholder?: string; wide?: boolean }
  | { key: string; label: string; type: "textarea"; hint?: string; placeholder?: string; wide?: boolean }
  | { key: string; label: string; type: "checkbox"; hint?: string; wide?: boolean }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; hint?: string; wide?: boolean };

export type Badge = { tone: "good" | "info" | "neutral" | "warn"; text: string };

/**
 * A row, with its display extras already worked out.
 *
 * `badges` and `subtitle` are plain data rather than render functions because
 * the pages that build these are Server Components, and a function cannot
 * cross that boundary. Computing them server-side keeps the per-type wording
 * next to the page it belongs to and this editor free of type-specific
 * branching.
 */
export type RefRow = {
  id: string;
  name: string;
  active: boolean;
  badges?: Badge[];
  subtitle?: string;
} & Record<string, unknown>;

type Props = {
  endpoint: string;
  rows: RefRow[];
  fields: FieldSpec[];
  /** Singular noun, used in buttons and confirmations. */
  noun: string;
  defaults?: Record<string, unknown>;
};

export default function ReferenceEditor({
  endpoint,
  rows,
  fields,
  noun,
  defaults = {},
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<RefRow | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blank = () =>
    Object.fromEntries(
      fields.map((f) => [f.key, f.type === "checkbox" ? false : ""]),
    ) as Record<string, unknown>;

  const [draft, setDraft] = useState<Record<string, unknown>>(blank());

  function openAdd() {
    setDraft({ ...blank(), active: true, ...defaults });
    setEditing(null);
    setAdding(true);
    setError(null);
  }

  function openEdit(row: RefRow) {
    setDraft(
      Object.fromEntries(
        fields.map((f) => [f.key, row[f.key] ?? (f.type === "checkbox" ? false : "")]),
      ),
    );
    setEditing(row);
    setAdding(false);
    setError(null);
  }

  function close() {
    setAdding(false);
    setEditing(null);
    setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const name = String(draft.name ?? "").trim();
    if (!name) {
      setError("A name is needed.");
      return;
    }
    setBusy(true);
    setError(null);

    // Empty text boxes mean "not set", not an empty string — numbers likewise.
    const payload = Object.fromEntries(
      fields.map((f) => {
        const v = draft[f.key];
        if (f.type === "checkbox") return [f.key, Boolean(v)];
        if (f.type === "number") return [f.key, v === "" || v == null ? null : Number(v)];
        const s = typeof v === "string" ? v.trim() : v;
        return [f.key, s === "" ? null : s];
      }),
    );
    payload.name = name;

    try {
      const res = await fetch(editing ? `${endpoint}/${editing.id}` : endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't save that.");
        return;
      }
      close();
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(row: RefRow) {
    setBusy(true);
    try {
      await fetch(`${endpoint}/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !row.active }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: RefRow) {
    if (
      !confirm(
        `Delete ${row.name}? Past visits keep their history but will stop naming this ${noun}. Turning it off instead is usually what you want.`,
      )
    )
      return;
    setBusy(true);
    try {
      await fetch(`${endpoint}/${row.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const open = adding || editing;

  return (
    <div className="space-y-4">
      {open ? (
        <Panel title={editing ? `Edit ${editing.name}` : `Add a ${noun}`}>
          <form onSubmit={save} className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
                  {f.type === "checkbox" ? (
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(draft[f.key])}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [f.key]: e.target.checked }))
                        }
                        className="h-5 w-5 shrink-0 accent-[#de0f0d]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-ink">{f.label}</span>
                        {f.hint && <span className="block text-xs text-muted">{f.hint}</span>}
                      </span>
                    </label>
                  ) : (
                    <label className="block">
                      <span className="block text-sm font-semibold text-ink">{f.label}</span>
                      {f.hint && <span className="mt-0.5 block text-xs text-muted">{f.hint}</span>}
                      <div className="mt-1.5">
                        {f.type === "textarea" ? (
                          <textarea
                            rows={3}
                            className={inputClass}
                            value={String(draft[f.key] ?? "")}
                            placeholder={f.placeholder}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                            }
                          />
                        ) : f.type === "select" ? (
                          <select
                            className={inputClass}
                            value={String(draft[f.key] ?? "")}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                            }
                          >
                            {f.options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={f.type}
                            className={inputClass}
                            value={String(draft[f.key] ?? "")}
                            placeholder={f.placeholder}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                            }
                          />
                        )}
                      </div>
                    </label>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <p role="alert" className="text-sm font-semibold text-brand-ink">
                {error}
              </p>
            )}

            <div className="flex gap-3 border-t border-cream-deep pt-4">
              <button type="submit" disabled={busy} className={buttonClass.primary}>
                {busy ? "Saving…" : editing ? "Save changes" : `Add ${noun}`}
              </button>
              <button type="button" onClick={close} className={buttonClass.secondary}>
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <div className="flex justify-end">
          <button type="button" onClick={openAdd} className={buttonClass.primary}>
            + Add {noun}
          </button>
        </div>
      )}

      <Panel>
        {rows.length === 0 ? (
          <Empty>No {noun}s yet.</Empty>
        ) : (
          <ul className="divide-y divide-cream-deep">
            {rows.map((row) => (
              <li
                key={row.id}
                className={`flex flex-wrap items-start justify-between gap-3 px-5 py-4 ${
                  row.active ? "" : "opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-ink">{row.name}</span>
                    {!row.active && <Pill>Off</Pill>}
                    {row.badges?.map((b) => (
                      <Pill key={b.text} tone={b.tone}>
                        {b.text}
                      </Pill>
                    ))}
                  </div>
                  {row.subtitle && <p className="mt-1 text-sm text-muted">{row.subtitle}</p>}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="rounded px-2.5 py-1.5 text-sm font-bold text-brand-ink hover:bg-cream"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(row)}
                    disabled={busy}
                    className="rounded px-2.5 py-1.5 text-sm font-bold text-muted hover:bg-cream"
                  >
                    {row.active ? "Turn off" : "Turn on"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(row)}
                    disabled={busy}
                    className="rounded px-2.5 py-1.5 text-sm font-bold text-muted hover:bg-cream"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
