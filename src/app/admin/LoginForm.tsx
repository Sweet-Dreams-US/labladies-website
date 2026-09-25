"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile";

/** Tall, high-contrast fields — this gets typed on a phone, often in a car. */
const fieldClass =
  "mt-1.5 w-full rounded-lg border border-cream-deep bg-cream px-4 py-3 text-base text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The sign-in has no rate limit of its own and one shared password, which
  // makes it the form a bot would actually hammer.
  const turnstile = useRef<TurnstileHandle>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const turnstileToken = await turnstile.current?.getToken();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstile_token: turnstileToken }),
      });

      if (res.ok) {
        // The gate is server-rendered, so refresh rather than navigate.
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "That email and password didn't match.");
      setPassword("");
      turnstile.current?.reset();
    } catch {
      setError("Couldn't reach the server. Try again.");
      turnstile.current?.reset();
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
          Collections, results follow-up and payments. Sign in to continue.
        </p>

        <label htmlFor="email" className="mt-6 block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoFocus
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={fieldClass}
        />

        <label htmlFor="password" className="mt-4 block text-sm font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={fieldClass}
        />

        <Turnstile ref={turnstile} action="admin-login" className="mt-4" />

        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-brand-ink">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !email || !password}
          className="mt-5 min-h-12 w-full rounded-lg bg-brand px-4 text-base font-bold text-white transition-colors hover:bg-brand-deep disabled:opacity-40"
        >
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
