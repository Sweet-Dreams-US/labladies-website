"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Edit-in-place cells for the tracking board.
 *
 * Michelle came from a spreadsheet, where changing a cell means clicking it
 * and typing. Making her open a form to correct one date was the single
 * biggest way this could have felt worse than the Google Doc it replaced.
 *
 * Shared behaviour:
 *
 *  - Dropdowns and dates save the moment they change. Text and numbers save on
 *    blur, or on Enter — saving per keystroke would be a request per letter.
 *  - The value shown is local state, so the field never fights the person
 *    typing in it while a save is in flight. It resyncs if the row changes
 *    underneath (someone else editing, or a refresh).
 *  - Escape reverts to the last saved value and gives up focus.
 *  - A save that fails puts the old value back and says so, rather than
 *    leaving a number on screen that isn't in the database.
 *
 * They look like plain text until you touch them — a table full of visible
 * input boxes is unreadable at this column count.
 */

type SaveState = "idle" | "saving" | "saved" | "error";

/** Shared by every field: run the save, track its state, report failure. */
function useSaver(onSave: (value: unknown) => Promise<boolean>) {
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  async function save(value: unknown) {
    setState("saving");
    const ok = await onSave(value);
    setState(ok ? "saved" : "error");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), ok ? 1200 : 4000);
    return ok;
  }

  return { state, save };
}

const ring = (state: SaveState) =>
  state === "saving"
    ? "ring-1 ring-inset ring-amber-300"
    : state === "saved"
      ? "ring-1 ring-inset ring-emerald-400"
      : state === "error"
        ? "ring-2 ring-inset ring-red-400"
        : "ring-1 ring-inset ring-transparent hover:ring-cream-deep";

const base =
  "w-full min-h-9 rounded-md bg-transparent px-1.5 py-1 text-sm text-ink outline-none transition-shadow focus:ring-2 focus:ring-brand/40 focus:bg-white";

export function InlineSelect({
  value,
  options,
  onSave,
  placeholder = "—",
  /**
   * Whether "not set" is a real choice. False for columns the database always
   * has a value for — status and payment method — where an empty option would
   * both be a lie and duplicate the option that already means the same thing.
   */
  allowEmpty = true,
  className = "",
}: {
  value: string | null;
  options: { value: string; label: string }[];
  onSave: (v: string | null) => Promise<boolean>;
  placeholder?: string;
  allowEmpty?: boolean;
  className?: string;
}) {
  const { state, save } = useSaver((v) => onSave((v as string) || null));

  return (
    <select
      value={value ?? ""}
      onChange={(e) => save(e.target.value)}
      disabled={state === "saving"}
      title={state === "error" ? "That didn't save — try again" : undefined}
      className={`${base} ${ring(state)} cursor-pointer appearance-none ${className}`}
    >
      {allowEmpty && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function InlineDate({
  value,
  onSave,
  className = "",
}: {
  value: string | null;
  onSave: (v: string | null) => Promise<boolean>;
  className?: string;
}) {
  const { state, save } = useSaver((v) => onSave((v as string) || null));

  return (
    <input
      type="date"
      defaultValue={value ?? ""}
      key={value ?? "empty"}
      onChange={(e) => save(e.target.value)}
      disabled={state === "saving"}
      className={`${base} ${ring(state)} cursor-pointer ${className}`}
    />
  );
}

/**
 * Text and numbers. Committed on blur or Enter rather than per keystroke, and
 * only when the value actually changed — tabbing through a row must not fire
 * a write per column.
 */
export function InlineText({
  value,
  onSave,
  placeholder = "—",
  multiline = false,
  numeric = false,
  prefix,
  className = "",
}: {
  value: string | number | null;
  onSave: (v: string | null) => Promise<boolean>;
  placeholder?: string;
  multiline?: boolean;
  numeric?: boolean;
  prefix?: string;
  className?: string;
}) {
  const initial = value === null || value === undefined ? "" : String(value);
  const [draft, setDraft] = useState(initial);
  const committed = useRef(initial);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { state, save } = useSaver((v) => onSave((v as string) || null));

  // Resync when the row changes underneath us, but never while the person is
  // mid-edit — that would eat what they are typing.
  useEffect(() => {
    if (document.activeElement !== ref.current) {
      committed.current = initial;
      setDraft(initial);
    }
  }, [initial]);

  async function commit() {
    const next = draft.trim();
    if (next === committed.current.trim()) return;

    const ok = await save(next);
    if (ok) {
      committed.current = next;
    } else {
      // Don't leave a value on screen that isn't in the database.
      setDraft(committed.current);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setDraft(committed.current);
      (e.target as HTMLElement).blur();
    }
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }

  const cls = `${base} ${ring(state)} ${className}`;

  const shared = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: commit,
    onKeyDown,
    placeholder,
    disabled: state === "saving",
  };

  if (multiline) {
    return (
      <textarea
        {...shared}
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        rows={2}
        className={`${cls} resize-y`}
      />
    );
  }

  return (
    <span className="flex items-center gap-0.5">
      {prefix && draft !== "" && <span className="text-sm text-muted">{prefix}</span>}
      <input
        {...shared}
        ref={ref as React.RefObject<HTMLInputElement>}
        className={cls}
        type={numeric ? "number" : "text"}
        inputMode={numeric ? "decimal" : undefined}
        step={numeric ? "0.01" : undefined}
        min={numeric ? "0" : undefined}
      />
    </span>
  );
}
