"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (res.ok) {
        // The gate is server-rendered, so refresh rather than navigate.
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "That passcode didn't work.");
      setPasscode("");
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-12">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-cream-deep bg-white p-8 shadow-sm"
      >
        <Image
          src="/labladies-logo.png"
          alt="Lab Ladies"
          width={160}
          height={64}
          className="h-14 w-auto"
          priority
        />

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Tracking board</h1>
        <p className="mt-1 text-sm text-muted">
          Collections, results follow-up and payments. Enter the passcode to continue.
        </p>

        <label htmlFor="passcode" className="sr-only">
          Admin passcode
        </label>
        <input
          id="passcode"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className="mt-6 w-full rounded-lg border border-cream-deep bg-cream px-4 py-3 font-mono text-base text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-brand-ink">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !passcode}
          className="mt-5 min-h-12 w-full rounded-lg bg-brand px-4 text-base font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-40"
        >
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
