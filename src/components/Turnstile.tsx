"use client";

import Script from "next/script";
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

/**
 * Cloudflare Turnstile widget.
 *
 * Renders nothing — and every form carries on as before — until
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. The server check has the matching
 * rule, so the two halves can't disagree.
 *
 * `appearance: "interaction-only"`: for almost everyone this is invisible and
 * verifies in the background. Only a suspicious visitor ever sees a checkbox.
 * This audience is largely older adults; a puzzle in front of "Request a
 * callback" would cost real calls.
 *
 * The parent gets a handle with `getToken()` — which waits briefly if the
 * check is still running, so a fast click on Submit doesn't fail — and
 * `reset()`, because a token is single-use and must be replaced after every
 * attempt, successful or not.
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = {
  /** The current token, waiting up to `waitMs` for one if the check is mid-flight. */
  getToken: (waitMs?: number) => Promise<string | null>;
  /** Discard the used token and fetch a fresh one. */
  reset: () => void;
};

export function Turnstile({
  action,
  ref,
  className = "",
}: {
  action: "inquiry" | "admin-login";
  ref: React.Ref<TurnstileHandle>;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const token = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );
  const [failed, setFailed] = useState(false);

  const render = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !box.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(box.current, {
      sitekey: TURNSTILE_SITE_KEY,
      action,
      theme: "light",
      size: "flexible",
      appearance: "interaction-only",
      // A token expires after five minutes. Someone typing a long message
      // would otherwise submit a dead one.
      "refresh-expired": "auto",
      callback: (t: string) => {
        token.current = t;
        setFailed(false);
      },
      "expired-callback": () => {
        token.current = null;
      },
      "error-callback": () => {
        token.current = null;
        setFailed(true);
        // Returning true tells Turnstile we've handled it; it retries itself.
        return true;
      },
    });
  }, [action]);

  useEffect(() => {
    if (scriptReady) render();
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [scriptReady, render]);

  useImperativeHandle(
    ref,
    () => ({
      async getToken(waitMs = 8000) {
        if (!TURNSTILE_SITE_KEY) return null;
        const until = Date.now() + waitMs;
        while (!token.current && Date.now() < until) {
          await new Promise((r) => setTimeout(r, 150));
        }
        return token.current;
      },
      reset() {
        token.current = null;
        if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      },
    }),
    [],
  );

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={box} className={className} />
      {failed && (
        <p className="mt-2 text-sm text-muted">
          Having trouble with the security check? You can always call us instead.
        </p>
      )}
    </>
  );
}
