# Lab Ladies — deployment & handoff

Everything below is what has to happen outside the code for the tracking board
and the blog to be live.

## 1. Environment variables (Vercel → Settings → Environment Variables)

Set these on **Production** and **Preview**. They are all server-only — none of
them may be prefixed `NEXT_PUBLIC_`.

| Variable | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://nxhwqtqroyerbbklywyn.supabase.co` | Shared FreeWebsites project |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_cVzB-1BXi5iuK3PIjAHFrQ_Tk76Gvpn` | Reads nothing on its own |
| `SUPABASE_ADMIN_TOKEN` | in `.env.local` | Unlocks only the `ll_` tables |
| `ADMIN_PASSCODE` | in `.env.local` | What Michelle types to sign in |
| `ALERT_EMAIL_TO` | `labladies2026@gmail.com` | Where overdue alerts go |
| `ALERT_FROM` | `Lab Ladies <alerts@labladies.net>` | Needs the domain verified in Resend |
| `RESEND_API_KEY` | *(not set yet)* | **Until this is set, alerts log instead of sending** |
| `CRON_SECRET` | generate a random string | Vercel signs the nightly cron with it |

The live values for `SUPABASE_ADMIN_TOKEN` and `ADMIN_PASSCODE` are in
`.env.local`, which is gitignored. Give Michelle the passcode directly — by
text or on a call, not by email.

Rotating `ADMIN_PASSCODE` instantly signs everyone out, by design: the session
cookie is signed with a secret derived from the passcode.

## 2. Turn the alert emails on

1. Add the Resend API key as `RESEND_API_KEY`.
2. Verify `labladies.net` in Resend so mail can come from `alerts@labladies.net`
   rather than the `onboarding@resend.dev` fallback.
3. Set `CRON_SECRET`.
4. Redeploy. The cron in `vercel.json` runs weekdays at 12:00 UTC (8am ET).

To test it by hand, sign into `/admin` and visit `/api/cron/alerts` — it
returns JSON saying how many alerts fired and whether the mail sent.

Current thresholds (`ALERT_DAYS` in `src/lib/tracking-types.ts`):

- **7 days** — collected, at a reference lab, results still not back.
- **2 days** — results are in but have not gone to the ordering practitioner.
- **30 days** — money still owed.

Michelle asked for "over a week" on the call, which is the first one. Adjust
the other two once she has used it for a fortnight and has an opinion.

## 3. GoDaddy domains

Michelle owns several domains. For each one:

1. Vercel → the `labladies-website` project → Settings → Domains → Add.
2. Vercel shows the records to create. At GoDaddy, point the apex `A` record at
   `76.76.21.21` and the `www` `CNAME` at `cname.vercel-dns.com`.
3. Set `labladies.net` as the **primary** domain in Vercel; add the rest with
   "Redirect to" pointing at it, so they all land on one domain and the SEO
   value is not split across several.
4. Once `labladies.net` resolves, confirm `site.url` in `src/lib/site.ts` still
   matches — canonical URLs, the sitemap and the structured data all read it.

## 4. Google Business Profile

Not created yet. It is the single highest-value thing left for local search —
"mobile phlebotomist near me" is a map result before it is a web result. Once
it exists, replace the placeholder `site.googleReviewUrl` in
`src/lib/site.ts` with the real review link.

## 5. What Michelle should know

- `/admin` — passcode, then the board. Works on her phone.
- **Dashboard** is the "what fell through a crack" page; open it first.
- **Tracking** is her sheet. Tabs across the top filter it; the Y/N cells are
  clickable to flip.
- **Export CSV** gives her the whole thing back as a spreadsheet whenever she
  wants it, in her original column order.
- Her 17 existing rows are already loaded.
- Quest and Labcorp visits will never show results columns or overdue warnings,
  because she has no access after drop-off. That is deliberate.
- **The system stores no test results** — only whether they came back and
  whether they were sent on. Worth saying out loud, given what she raised.

## 6. Open items

- Rates for the pricing page (everything currently reads "Call for pricing").
- Confirm Dr. Lubin / Dr. Vega / Dr. Guia's practice affiliations.
- Carolyn Salowe's row has no lab recorded — her sheet just said "RL-".
- Next blog post due roughly 6 Oct 2026 to keep the fortnightly cadence.
