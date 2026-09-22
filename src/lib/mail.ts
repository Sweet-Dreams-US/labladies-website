import "server-only";
import { site } from "./site";

/**
 * Outbound email for the overdue alerts.
 *
 * Degrades rather than fails: with no RESEND_API_KEY the send is logged and
 * reported as "demo", so the nightly job can run in preview without either
 * erroring or quietly mailing anyone.
 */

export type SendResult = "sent" | "demo" | "failed";

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  logAs: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[${opts.logAs}:demo]`, JSON.stringify({ to: opts.to, subject: opts.subject }));
    return "demo";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ALERT_FROM || "Lab Ladies <onboarding@resend.dev>",
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });

    if (!res.ok) {
      console.error(`[${opts.logAs}:resend-error]`, res.status, await res.text());
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error(`[${opts.logAs}:exception]`, err);
    return "failed";
  }
}

/** House style: brand-red header, plain body. */
export function shell(opts: { heading: string; intro?: string; body: string }) {
  return `
  <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#fdf6ec;padding:24px">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #f6ead6;border-radius:12px;overflow:hidden">
      <div style="background:#de0f0d;padding:20px 24px">
        <div style="color:#ffffff;font-size:19px;font-weight:800;letter-spacing:-0.01em">Lab Ladies</div>
        <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-top:2px">
          Collection tracking &middot; ${escapeHtml(site.phone)}
        </div>
      </div>
      <div style="padding:24px">
        <h1 style="margin:0 0 10px;font-size:19px;line-height:1.35;color:#1a1512">
          ${escapeHtml(opts.heading)}
        </h1>
        ${opts.intro ? `<p style="margin:0 0 18px;font-size:14.5px;line-height:1.6;color:#5b5450">${escapeHtml(opts.intro)}</p>` : ""}
        ${opts.body}
      </div>
      <div style="border-top:1px solid #f6ead6;padding:16px 24px;font-size:12px;color:#5b5450">
        Sent by the Lab Ladies tracking board. This message lists patient names and
        what is outstanding — it never contains test results.
      </div>
    </div>
  </div>`;
}
