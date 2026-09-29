"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Tells /api/v that a page was viewed — on first load and on every in-site
 * navigation after it. Cookie-free: nothing is stored in the browser.
 *
 * The referring site is only sent on the first page of a visit; after that
 * the "referrer" is just the previous page on this site, which isn't one.
 * `sendBeacon` so the request survives the page being closed or navigated
 * away from, and never delays anything the visitor is doing.
 */
export function PageviewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);
  const first = useRef(true);

  useEffect(() => {
    // Guards the double-run React does in development, and repeat renders.
    if (!pathname || last.current === pathname) return;
    last.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      referrer: first.current ? document.referrer : null,
    });
    first.current = false;

    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/v", blob)) {
        void fetch("/api/v", { method: "POST", body: payload, keepalive: true });
      }
    } catch {
      /* counting must never break the page */
    }
  }, [pathname]);

  return null;
}
