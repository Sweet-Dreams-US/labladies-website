# Lab Ladies — deployment & handoff

Everything below is what has to happen outside the code for the tracking board
and the blog to be live.

**Status: deployed to production 22 Sep 2026.** The board is live at
<https://labladies-website.vercel.app/admin> with Michelle's 17 rows loaded.
Everything in section 1 is already set; sections 2–4 are still outstanding.

## 1. Environment variables — DONE

Set on Production, Preview and Development. All server-only — none of them may
be prefixed `NEXT_PUBLIC_`.

| Variable | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://nxhwqtqroyerbbklywyn.supabase.co` | Shared FreeWebsites project |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_cVzB-1BXi5iuK3PIjAHFrQ_Tk76Gvpn` | Reads nothing on its own |
| `SUPABASE_ADMIN_TOKEN` | in `.env.local` | Unlocks only the `ll_` tables |
| `ADMIN_EMAIL` | `labladies2026@gmail.com` | The email half of the sign-in |
| `ADMIN_PASSCODE` | in `.env.local` | The password half |
| `ALERT_EMAIL_TO` | `labladies2026@gmail.com` | Where overdue alerts go |
| `ALERT_FROM` | `Lab Ladies <alerts@labladies.net>` | Needs the domain verified in Resend |
| `RESEND_API_KEY` | **still not set** | **Until this is set, alerts log instead of sending** |
| `CRON_SECRET` | set | Vercel signs the nightly cron with it |

The live values for `SUPABASE_ADMIN_TOKEN` and `ADMIN_PASSCODE` are in
`.env.local`, which is gitignored. Give Michelle the password directly — by
text or on a call. Do not send it to `labladies2026@gmail.com`, since that
address is now half of the credential.

Changing either `ADMIN_EMAIL` or `ADMIN_PASSCODE` instantly signs everyone
out, by design: the session cookie is signed with a secret derived from both.

There is one shared credential rather than per-person accounts. That is the
right weight for a three-person office, and who performed a collection is
recorded as data on the encounter rather than inferred from who was logged in.
If the team grows to where "who changed this" matters, `src/lib/admin-auth.ts`
is the file that grows a users table.

## 2. Turn the alert emails on — OUTSTANDING

The cron is deployed and running weekdays at 12:00 UTC (8am ET), but with no
`RESEND_API_KEY` it logs what it would have sent instead of sending. It also
does not mark those alerts as sent, so nothing is lost — the moment the key is
added, the backlog goes out on the next run.

1. Add the Resend API key as `RESEND_API_KEY`.
2. Verify `labladies.net` in Resend, then change `ALERT_FROM` to
   `Lab Ladies <alerts@labladies.net>` — it is currently the
   `onboarding@resend.dev` fallback.
3. Redeploy.

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
- **Almost every cell on the tracking board is editable where it sits.** Click
  a date, a dropdown or a note and it saves itself — a green outline means
  saved, red means it didn't. No need to open Edit unless she wants the full
  form. "Full form" is still there for test types and the results dates.
- **Inquiries** is new: the website now has a "request a callback" form, and
  anything submitted lands there. Tap to call them, then tap Contacted — the
  time is filled in automatically. Anything left on New for a day shows up in
  the overdue list and the nightly email.

## 6. Open items

- Rates for the pricing page (everything currently reads "Call for pricing").
- Confirm Dr. Lubin / Dr. Vega / Dr. Guia's practice affiliations.
- Carolyn Salowe's row has no lab recorded — her sheet just said "RL-".
- Next blog post due roughly 6 Oct 2026 to keep the fortnightly cadence.
