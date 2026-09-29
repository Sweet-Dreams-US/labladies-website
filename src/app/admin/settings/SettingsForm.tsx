"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { Panel, buttonClass, inputClass } from "../ui";

/**
 * The links that put Google buttons on the public site.
 *
 * Saving is publishing: the API expires the site's cache for these links, so
 * the button appears (or changes, or disappears) on the very next page load.
 * There is no separate "go live" step for Michelle to forget.
 */

type Field = {
  key: "google_review_url" | "google_business_url";
  label: string;
  shows: string;
  how: string[];
  example: string;
};

const FIELDS: Field[] = [
  {
    key: "google_review_url",
    label: "Review link",
    shows: "Adds a “Leave a Google Review” button to the homepage and the Contact page.",
    how: [
      "Open google.com/business and sign in with the account that owns the Lab Ladies profile.",
      "Choose “Ask for reviews” (sometimes “Get more reviews”).",
      "Copy the link it gives you and paste it here.",
    ],
    example: "https://g.page/r/…/review",
  },
  {
    key: "google_business_url",
    label: "Business Profile link",
    shows: "Adds a “See Our Google Reviews” / “Find Us on Google” button beside it.",
    how: [
      "Search “Lab Ladies” on Google Maps and open your listing.",
      "Tap Share, then Copy link.",
      "Paste it here.",
    ],
    example: "https://maps.app.goo.gl/…",
  },
];

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [values, setValues] = useState({
    google_review_url: initial.google_review_url ?? "",
    google_business_url: initial.google_business_url ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  const dirty =
    values.google_review_url !== (initial.google_review_url ?? "") ||
    values.google_business_url !== (initial.google_business_url ?? "");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ tone: "bad", text: data.error || "Couldn't save that. Try again." });
        return;
      }
      // Show the cleaned-up link (https added, stray spaces gone).
      setValues({
        google_review_url: data.google_review_url ?? values.google_review_url,
        google_business_url: data.google_business_url ?? values.google_business_url,
      });
      setMessage({ tone: "good", text: "Saved — it's live on the website now." });
      router.refresh();
    } catch {
      setMessage({ tone: "bad", text: "Couldn't reach the server. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {FIELDS.map((f) => {
        const v = values[f.key];
        return (
          <Panel key={f.key} title={f.label} description={f.shows}>
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                <input
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`${inputClass} min-w-0 flex-1`}
                  value={v}
                  placeholder={f.example}
                  onChange={(e) => setValues((cur) => ({ ...cur, [f.key]: e.target.value }))}
                />
                {v && (
                  <a
                    href={v}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass.secondary}
                  >
                    Test link
                  </a>
                )}
              </div>
              <details className="text-sm text-muted">
                <summary className="cursor-pointer font-semibold text-brand-ink">
                  Where do I find this?
                </summary>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  {f.how.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>
              <p className="text-xs text-muted">
                Leave it empty to hide the button. Only Google links are accepted.
              </p>
            </div>
          </Panel>
        );
      })}

      {message && (
        <p
          role="status"
          className={`text-sm font-semibold ${message.tone === "good" ? "text-emerald-700" : "text-brand-ink"}`}
        >
          {message.text}
        </p>
      )}

      <button type="submit" disabled={busy || !dirty} className={buttonClass.primary}>
        {busy ? "Saving…" : "Save and publish"}
      </button>
    </form>
  );
}
