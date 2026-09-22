"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";
import {
  INQUIRY_FOR_OPTIONS,
  PREFER_OPTIONS,
  SERVICE_OPTIONS,
} from "@/lib/inquiry-types";

/**
 * Request-a-callback form.
 *
 * The phone number stays the primary call to action everywhere — this is the
 * second path, for the people who won't ring: facility coordinators mid-shift,
 * families in another timezone, anyone reading the site at eleven at night.
 *
 * Deliberately short. Every extra field costs submissions, and everything
 * genuinely needed comes out of the callback anyway. Note what is NOT asked
 * for: no date of birth, no insurance, nothing clinical. The message field
 * says so out loud, because a stranger will otherwise type their symptoms in.
 */

const field =
  "w-full rounded-xl border border-cream-deep bg-white px-4 py-3.5 text-lg text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

const label = "block text-base font-bold text-ink";

export function InquiryForm() {
  const pathname = usePathname();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [prefer, setPrefer] = useState<string>(PREFER_OPTIONS[0]);
  const [inquiryFor, setInquiryFor] = useState("");
  const [service, setService] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  /** Bot trap. A real person never fills this in; it is hidden from them. */
  const [company, setCompany] = useState("");

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return setError("Please tell us your name.");
    if (!phone.trim() && !email.trim()) {
      return setError("Please leave a phone number or an email so we can reach you.");
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          prefer,
          inquiry_for: inquiryFor,
          service,
          area,
          message,
          company,
          source_path: pathname,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please call us instead.");
        return;
      }
      setSent(true);
    } catch {
      setError("Couldn't reach the server. Please call us instead.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-cream-deep bg-white p-8 text-center shadow-sm">
        <p className="text-2xl font-extrabold text-ink">Thank you — we have it.</p>
        <p className="mx-auto mt-3 max-w-md text-lg text-muted">
          One of us will get back to you shortly. If it is urgent, please call{" "}
          <a href={site.phoneHref} className="font-bold text-brand-ink underline">
            {site.phone}
          </a>{" "}
          — that is always the fastest way to reach us.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-cream-deep bg-white p-7 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="iq-name" className={label}>
            Your name
          </label>
          <input
            id="iq-name"
            className={`mt-2 ${field}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label htmlFor="iq-phone" className={label}>
            Phone
          </label>
          <input
            id="iq-phone"
            type="tel"
            inputMode="tel"
            className={`mt-2 ${field}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        <div>
          <label htmlFor="iq-email" className={label}>
            Email
          </label>
          <input
            id="iq-email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={`mt-2 ${field}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="iq-prefer" className={label}>
            Best way to reach you
          </label>
          <select
            id="iq-prefer"
            className={`mt-2 ${field}`}
            value={prefer}
            onChange={(e) => setPrefer(e.target.value)}
          >
            {PREFER_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="iq-for" className={label}>
            This is for
          </label>
          <select
            id="iq-for"
            className={`mt-2 ${field}`}
            value={inquiryFor}
            onChange={(e) => setInquiryFor(e.target.value)}
          >
            <option value="">— select —</option>
            {INQUIRY_FOR_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="iq-service" className={label}>
            What you need
          </label>
          <select
            id="iq-service"
            className={`mt-2 ${field}`}
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="">— select —</option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="iq-area" className={label}>
            Your area
          </label>
          <input
            id="iq-area"
            className={`mt-2 ${field}`}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Boca Raton"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="iq-message" className={label}>
            Anything else
          </label>
          <p className="mt-1 text-sm text-muted">
            Please don&rsquo;t include medical details here — we&rsquo;ll go through everything
            on the phone.
          </p>
          <textarea
            id="iq-message"
            rows={4}
            className={`mt-2 ${field}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Need a fasting draw for my mother at her assisted living community"
          />
        </div>
      </div>

      {/* Honeypot: off-screen and hidden from assistive tech, not display:none,
          which some bots know to skip. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="iq-company">Company</label>
        <input
          id="iq-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="mt-5 font-semibold text-brand-ink">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-brand px-7 text-lg font-bold text-white shadow-lg shadow-brand/25 transition-colors hover:bg-brand-deep disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Sending…" : "Request a callback"}
      </button>

      <p className="mt-4 text-sm text-muted">
        Prefer to talk now?{" "}
        <a href={site.phoneHref} className="font-bold text-brand-ink underline">
          Call {site.phone}
        </a>
        .
      </p>
    </form>
  );
}
