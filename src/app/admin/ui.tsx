import type { ReactNode } from "react";

/**
 * Admin-only primitives. Deliberately plainer and denser than the public
 * site's components: this is a working tool used many times a day, not a
 * marketing page. Tap targets stay generous because it gets used on a phone
 * in the field, between visits.
 */

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-cream-deep bg-white shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-cream-deep px-5 py-4">
          <div>
            {title && <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-6 py-24">
      <div className="rounded-2xl border border-cream-deep bg-white p-8 shadow-sm">
        <h1 className="text-xl font-extrabold tracking-tight text-ink">{title}</h1>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-muted">{children}</p>;
}

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-cream text-muted ring-cream-deep",
    good: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    warn: "bg-amber-50 text-amber-900 ring-amber-200",
    bad: "bg-red-50 text-brand-ink ring-red-200",
    info: "bg-sky-50 text-sky-900 ring-sky-200",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${tones}`}
    >
      {children}
    </span>
  );
}

/** Y / N / n-a, rendered so a column can be scanned down at a glance. */
export function YesNo({ value, na = false }: { value: boolean; na?: boolean }) {
  if (na) return <span className="text-sm text-muted/60" title="Does not apply">—</span>;
  return value ? (
    <span className="font-bold text-emerald-700">Y</span>
  ) : (
    <span className="font-bold text-muted/70">N</span>
  );
}

export const inputClass =
  "w-full rounded-lg border border-cream-deep bg-white px-3 py-2.5 text-base text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export const labelClass = "block text-sm font-semibold text-ink";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export const buttonClass = {
  primary: `${buttonBase} bg-brand text-white hover:bg-brand-deep`,
  secondary: `${buttonBase} bg-white text-ink ring-1 ring-inset ring-cream-deep hover:bg-cream`,
  danger: `${buttonBase} bg-white text-brand-ink ring-1 ring-inset ring-red-200 hover:bg-red-50`,
  quiet: `${buttonBase} text-muted hover:bg-cream hover:text-ink`,
};

/** Money, or a dash. Accepts the strings PostgREST returns for numeric. */
export function money(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
}

/** A date column that never shifts by a day: these are plain dates, not instants. */
export function shortDate(v: string | null | undefined) {
  if (!v) return "—";
  const [y, m, d] = v.split("-");
  if (!y || !m || !d) return v;
  return `${Number(m)}/${Number(d)}/${y.slice(2)}`;
}
