"use client";

import { useState } from "react";

/**
 * Page views per day — one series, so no legend: the panel title names it.
 *
 * Bars rather than a line: these are discrete daily counts, and at 7 or 30
 * points a bar per day reads more honestly than a line implying values
 * between days. Brand red passes the palette checks against the white panel
 * (contrast >= 3:1, validated). Every bar has a hover/focus tooltip with the
 * exact count, and the same numbers are always available as text in the
 * summary tiles, so nothing here is readable only by colour or by hovering.
 */

type Day = { day: string; views: number; visitors: number };

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", opts);

export default function DailyChart({ daily }: { daily: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.views));
  // A round axis top so the one gridline label reads cleanly.
  const step = max <= 5 ? 1 : max <= 20 ? 5 : max <= 100 ? 20 : 10 ** Math.floor(Math.log10(max));
  const top = Math.ceil(max / step) * step;

  // Label only a handful of dates; a label under every bar collides at 30.
  const every = daily.length <= 7 ? 1 : daily.length <= 31 ? 7 : 14;
  const active = hover !== null ? daily[hover] : null;

  return (
    <div className="px-5 pt-4 pb-5">
      <div className="mb-2 h-6 text-sm text-muted" aria-live="polite">
        {active ? (
          <>
            <span className="font-semibold text-ink">
              {fmt(active.day, { weekday: "short", month: "short", day: "numeric" })}
            </span>
            {" · "}
            {active.views} {active.views === 1 ? "view" : "views"} · {active.visitors}{" "}
            {active.visitors === 1 ? "visitor" : "visitors"}
          </>
        ) : (
          "Hover or tap a bar for the exact count."
        )}
      </div>

      <div className="relative h-48">
        {/* Recessive gridlines: the top and the middle, labelled at the edge. */}
        {[top, top / 2].map((g) => (
          <div
            key={g}
            className="absolute inset-x-0 border-t border-dashed border-cream-deep"
            style={{ bottom: `${(g / top) * 100}%` }}
          >
            <span className="absolute -top-2.5 right-0 bg-white pl-1 text-[11px] text-muted tabular-nums">
              {Number.isInteger(g) ? g : g.toFixed(1)}
            </span>
          </div>
        ))}

        <div className="absolute inset-0 right-8 flex items-end gap-[2px]">
          {daily.map((d, i) => (
            <button
              key={d.day}
              type="button"
              aria-label={`${fmt(d.day, { month: "long", day: "numeric" })}: ${d.views} views, ${d.visitors} visitors`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => setHover(i)}
              // The hit target is the full column, taller than the bar itself.
              className="group flex h-full min-w-0 flex-1 items-end focus:outline-none"
            >
              <span
                className={`block w-full rounded-t-[4px] transition-colors ${
                  d.views === 0 ? "bg-cream-deep" : hover === i ? "bg-brand-deep" : "bg-brand"
                }`}
                style={{ height: d.views === 0 ? "2px" : `${Math.max(3, (d.views / top) * 100)}%` }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-[2px] pr-8 text-[11px] text-muted">
        {daily.map((d, i) => (
          <span key={d.day} className="min-w-0 flex-1 overflow-visible text-center whitespace-nowrap">
            {i % every === 0 || i === daily.length - 1 ? fmt(d.day, { month: "short", day: "numeric" }) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
