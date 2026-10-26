"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Review, ReviewSource } from "@/lib/reviews";
import { Empty, Field, Panel, Pill, buttonClass, inputClass } from "../ui";

/**
 * Add, edit, hide and remove the reviews in the homepage strip.
 *
 * Every save publishes — the strip on the website updates on its next load.
 * The rule for what shows is the database's, and this page says it out loud
 * beside every review so nobody wonders why one is missing: switched on AND
 * 4 or 5 stars.
 */

const SOURCES: { value: ReviewSource; label: string }[] = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "yelp", label: "Yelp" },
  { value: "direct", label: "Sent to us directly" },
];

type Draft = {
  author_name: string;
  rating: number;
  body: string;
  review_date: string;
  source: ReviewSource;
  source_url: string;
  visible: boolean;
};

const EMPTY: Draft = {
  author_name: "",
  rating: 5,
  body: "",
  review_date: "",
  source: "google",
  source_url: "",
  visible: true,
};

const toDraft = (r: Review): Draft => ({
  author_name: r.author_name,
  rating: r.rating,
  body: r.body,
  review_date: r.review_date ?? "",
  source: r.source,
  source_url: r.source_url ?? "",
  visible: r.visible,
});

export const showsOnSite = (r: { visible: boolean; rating: number }) => r.visible && r.rating >= 4;

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className={`min-h-11 min-w-11 rounded-lg text-2xl leading-none transition-colors ${
            n <= value ? "text-brand" : "text-cream-deep hover:text-brand/40"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsManager({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(reviews.length ? null : "new");
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "good" | "bad"; text: string } | null>(null);

  const live = reviews.filter(showsOnSite).length;

  function open(id: string | "new") {
    setEditing(id);
    setMessage(null);
    const r = reviews.find((x) => x.id === id);
    setDraft(r ? toDraft(r) : EMPTY);
  }

  async function send(url: string, method: string, body?: unknown) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ tone: "bad", text: data.error || "Couldn't save that. Try again." });
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setMessage({ tone: "bad", text: "Couldn't reach the server. Try again." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const ok =
      editing === "new"
        ? await send("/api/admin/reviews", "POST", draft)
        : await send(`/api/admin/reviews/${editing}`, "PATCH", draft);
    if (ok) {
      setMessage({
        tone: "good",
        text: showsOnSite(draft)
          ? "Saved — it's on the website now."
          : "Saved. It won't show on the website (only switched-on 4 and 5 star reviews do).",
      });
      setEditing(null);
      setDraft(EMPTY);
    }
  }

  async function toggle(r: Review) {
    await send(`/api/admin/reviews/${r.id}`, "PATCH", { visible: !r.visible });
  }

  async function remove(r: Review) {
    if (!confirm(`Delete the review from ${r.author_name}? This can't be undone — "Hide" keeps it.`)) return;
    await send(`/api/admin/reviews/${r.id}`, "DELETE");
  }

  const form = (
    <form onSubmit={save} className="space-y-5 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Reviewer's name" hint="As shown on Google. The site shows first name and last initial only.">
          <input
            className={inputClass}
            value={draft.author_name}
            onChange={(e) => setDraft({ ...draft, author_name: e.target.value })}
            placeholder="e.g. Margaret Thompson"
            required
          />
        </Field>
        <div>
          <span className="block text-sm font-semibold text-ink">Stars</span>
          <span className="mt-0.5 block text-xs text-muted">Only 4 and 5 stars appear on the website.</span>
          <div className="mt-1.5">
            <StarPicker value={draft.rating} onChange={(n) => setDraft({ ...draft, rating: n })} />
          </div>
        </div>
      </div>

      <Field
        label="The review"
        hint="Paste it exactly as they wrote it. Skip any review that mentions a patient's health details."
      >
        <textarea
          rows={5}
          className={inputClass}
          value={draft.body}
          maxLength={1500}
          onChange={(e) => setDraft({ ...draft, body: e.target.value })}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Where it was left">
          <select
            className={inputClass}
            value={draft.source}
            onChange={(e) => setDraft({ ...draft, source: e.target.value as ReviewSource })}
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date of the review" hint="Optional.">
          <input
            type="date"
            className={inputClass}
            value={draft.review_date}
            onChange={(e) => setDraft({ ...draft, review_date: e.target.value })}
          />
        </Field>
        <Field label="Link to the review" hint="Optional — adds “Read on Google”.">
          <input
            type="url"
            className={inputClass}
            value={draft.source_url}
            placeholder="https://"
            onChange={(e) => setDraft({ ...draft, source_url: e.target.value })}
          />
        </Field>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={draft.visible}
          onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
          className="h-5 w-5 accent-[#de0f0d]"
        />
        <span className="text-sm font-semibold text-ink">Show on the website</span>
      </label>

      <div className="flex flex-wrap gap-3 border-t border-cream-deep pt-4">
        <button type="submit" disabled={busy} className={buttonClass.primary}>
          {busy ? "Saving…" : editing === "new" ? "Add review" : "Save changes"}
        </button>
        {reviews.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setMessage(null);
            }}
            className={buttonClass.secondary}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {message && (
        <p role="status" className={`text-sm font-semibold ${message.tone === "good" ? "text-emerald-700" : "text-brand-ink"}`}>
          {message.text}
        </p>
      )}

      {editing === "new" ? (
        <Panel title="Add a review">{form}</Panel>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {live} of {reviews.length} {reviews.length === 1 ? "review" : "reviews"} showing on the website.
          </p>
          <button type="button" onClick={() => open("new")} className={buttonClass.primary}>
            + Add a review
          </button>
        </div>
      )}

      <Panel>
        {reviews.length === 0 ? (
          <Empty>
            No reviews yet. Once Lab Ladies has a Google Business Profile and reviews start coming in,
            copy the good ones here and they&rsquo;ll scroll across the homepage.
          </Empty>
        ) : (
          <ul className="divide-y divide-cream-deep">
            {reviews.map((r) =>
              editing === r.id ? (
                <li key={r.id}>{form}</li>
              ) : (
                <li key={r.id} className={`p-5 ${showsOnSite(r) ? "" : "opacity-70"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-brand" aria-label={`${r.rating} stars`}>
                          {"★".repeat(r.rating)}
                          <span className="text-cream-deep">{"★".repeat(5 - r.rating)}</span>
                        </span>
                        <span className="font-bold text-ink">{r.author_name}</span>
                        {showsOnSite(r) ? (
                          <Pill tone="good">On the website</Pill>
                        ) : r.rating < 4 ? (
                          <Pill tone="neutral">Not shown — under 4 stars</Pill>
                        ) : (
                          <Pill tone="neutral">Hidden</Pill>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-ink">{r.body}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => open(r.id)} className="rounded px-2.5 py-1.5 text-sm font-bold text-brand-ink hover:bg-cream">
                        Edit
                      </button>
                      <button type="button" disabled={busy} onClick={() => toggle(r)} className="rounded px-2.5 py-1.5 text-sm font-bold text-muted hover:bg-cream">
                        {r.visible ? "Hide" : "Show"}
                      </button>
                      <button type="button" disabled={busy} onClick={() => remove(r)} className="rounded px-2.5 py-1.5 text-sm font-bold text-muted hover:bg-cream">
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </Panel>
    </div>
  );
}
