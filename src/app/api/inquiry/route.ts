import { NextResponse } from "next/server";
import { escapeHtml, sendMail, shell } from "@/lib/mail";
import { markInquiryEmail, saveInquiry } from "@/lib/inquiries";
import { site } from "@/lib/site";

/**
 * Public endpoint for the callback form.
 *
 * Order matters: store first, then email. If the mail provider is down
 * Michelle still has the lead in /admin; if the database is down she still
 * gets the email. Losing both takes two outages at once.
 */

const MAX = 2000;
const clean = (v: unknown, limit = 200) =>
  typeof v === "string" ? v.trim().slice(0, limit) || null : null;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON object." }, { status: 400 });
  }

  // Honeypot. Answer 200 so a bot has nothing to learn from the response.
  if (clean(body.company)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 160);

  if (!name) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  if (!phone && !email) {
    return NextResponse.json(
      { error: "Please leave a phone number or an email so we can reach you." },
      { status: 400 },
    );
  }

  const inquiry = {
    name,
    phone,
    email,
    prefer: clean(body.prefer, 40),
    inquiry_for: clean(body.inquiry_for, 80),
    service: clean(body.service, 120),
    area: clean(body.area, 120),
    message: clean(body.message, MAX),
    source_path: clean(body.source_path, 200),
  };

  const id = await saveInquiry(inquiry);

  const rows = ([
    ["Name", inquiry.name],
    ["Phone", inquiry.phone ?? ""],
    ["Email", inquiry.email ?? ""],
    ["Prefers", inquiry.prefer ?? ""],
    ["This is for", inquiry.inquiry_for ?? ""],
    ["Needs", inquiry.service ?? ""],
    ["Area", inquiry.area ?? ""],
    ["Page", inquiry.source_path ?? ""],
  ] as [string, string][]).filter(([, v]) => Boolean(v));

  const result = await sendMail({
    to: process.env.ALERT_EMAIL_TO || site.email,
    subject: `New website inquiry — ${inquiry.name}`,
    logAs: "ll-inquiry",
    html: shell({
      heading: `${inquiry.name} asked for a callback`,
      intro: inquiry.phone
        ? `Call back on ${inquiry.phone}.`
        : "They left an email address rather than a phone number.",
      body: `
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          ${rows
            .map(
              ([k, v]) => `<tr>
                <td style="padding:7px 12px 7px 0;color:#5b5450;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td>
                <td style="padding:7px 0;font-weight:600;color:#1a1512">${escapeHtml(v)}</td>
              </tr>`,
            )
            .join("")}
        </table>
        ${
          inquiry.message
            ? `<p style="margin:18px 0 0;padding:14px;background:#fdf6ec;border-radius:8px;font-size:14px;line-height:1.6;color:#1a1512">
                 ${escapeHtml(inquiry.message)}
               </p>`
            : ""
        }`,
    }),
  });

  if (id) await markInquiryEmail(id, result);

  // The submission succeeded as far as the person is concerned either way —
  // their details are stored, and a failed email is Michelle's problem to see
  // in the logs, not theirs to retype a form over.
  return NextResponse.json({ ok: true });
}
