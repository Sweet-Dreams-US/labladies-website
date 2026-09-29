"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

const INTRO = "Introduction";

/**
 * Table of contents for a post, with a reading progress indicator and the
 * section being read.
 *
 * Wide screens (xl and up): a small panel pinned to the bottom right corner,
 * in the gutter beside the text. Everything narrower: a bar pinned above the
 * mobile call bar showing the current section, with an arrow that opens the
 * contents. Headings are plain in-page links, so the list works without
 * scripting too.
 */
export function PostToc({ headings, articleId }: { headings: Heading[]; articleId: string }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const rect = article.getBoundingClientRect();

      const span = rect.height - vh;
      setProgress(
        span > 0
          ? Math.min(1, Math.max(0, -rect.top / span))
          : rect.bottom <= vh
            ? 1
            : 0,
      );

      let current = -1;
      headings.forEach((h, i) => {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= vh * 0.3) current = i;
      });
      setActive(current);

      // Shown only while the article itself is on screen, so it never sits
      // on top of the footer or the call to action after it.
      setVisible(rect.top < vh * 0.7 && rect.bottom > vh * 0.3);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [articleId, headings]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const pct = Math.round(progress * 100);
  const label = active >= 0 ? headings[active].text : INTRO;

  const list = (onPick?: () => void) => (
    <ol className="space-y-1">
      {headings.map((h, i) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={onPick}
            aria-current={i === active ? "location" : undefined}
            className={`block rounded-xl px-3 py-2.5 text-base leading-snug font-bold transition-colors ${
              i === active ? "bg-cream text-brand-ink" : "text-ink hover:bg-cream"
            }`}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  const bar = (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-deep" aria-hidden>
      <div
        className="h-full rounded-full bg-brand transition-[width] duration-150"
        style={{ width: `${pct}%` }}
      />
    </div>
  );

  return (
    <div className={visible ? "" : "invisible"}>
      {/* Desktop: corner panel. */}
      <nav
        aria-label="Contents"
        className="fixed right-3 bottom-6 z-40 hidden w-56 rounded-2xl border border-cream-deep bg-white/95 p-3 shadow-lg backdrop-blur xl:block"
      >
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          aria-controls="toc-panel-list"
          className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl px-2 text-left text-sm font-bold tracking-[0.12em] text-brand-ink uppercase"
        >
          <span>On this page</span>
          <span className="tabular-nums">{pct}%</span>
        </button>
        <div className="px-2 pb-1">{bar}</div>
        {panelOpen && (
          <div id="toc-panel-list" className="mt-2 max-h-[55vh] overflow-y-auto">
            {list()}
          </div>
        )}
      </nav>

      {/* Mobile and tablet: bottom bar above the call bar. */}
      <nav
        aria-label="Contents"
        className="fixed inset-x-0 bottom-[5rem] z-40 border-t border-cream-deep bg-white shadow-[0_-6px_18px_rgba(26,21,18,0.08)] md:bottom-0 xl:hidden"
      >
        {sheetOpen && (
          <div id="toc-sheet" className="max-h-[50vh] overflow-y-auto px-3 pt-3 pb-1">
            {list(() => setSheetOpen(false))}
          </div>
        )}
        <div className="px-4 pt-2">{bar}</div>
        <button
          type="button"
          onClick={() => setSheetOpen((v) => !v)}
          aria-expanded={sheetOpen}
          aria-controls="toc-sheet"
          className="flex min-h-14 w-full items-center gap-3 px-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold tracking-[0.14em] text-brand-ink uppercase">
              Reading now
            </span>
            <span className="block truncate text-base font-bold">{label}</span>
          </span>
          <span className="text-sm font-bold text-muted tabular-nums">{pct}%</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className={`h-6 w-6 shrink-0 transition-transform ${sheetOpen ? "rotate-180" : ""}`}
          >
            <path
              d="m6 15 6-6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">{sheetOpen ? "Close contents" : "Open contents"}</span>
        </button>
      </nav>
    </div>
  );
}
