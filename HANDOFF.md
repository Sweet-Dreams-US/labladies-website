# Lab Ladies — deployment & handoff

Everything below is what has to happen outside the code for the tracking board
and the blog to be live.

**Status:** live at <https://labladies-website.vercel.app>, moving to
**<https://labladies.com>** — the official domain, decided 25 Sep 2026. The
Vercel project now lives in the **Sweet Dreams' projects** team (moved from
Team Marcuccilli the same day) and deploys from GitHub on every push to `main`.

> **⚠ labladies.com is a *leased* domain** — the only one on the list that is
> not owned outright. GoDaddy shows auto-payment due **22 Oct 2026** and a
> "Validate billing details" warning. If that lease lapses, the official
> address goes dark and every other domain redirects into nothing. Settle the
> billing, and consider buying it out, before relying on it.

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
| `ALERT_FROM` | `Lab Ladies <onboarding@resend.dev>` | Switch to `alerts@labladies.com` once verified in Resend |
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
2. Verify `labladies.com` in Resend, then change `ALERT_FROM` to
   `Lab Ladies <alerts@labladies.com>` — it is currently the
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

## 3. Domains

**`labladies.com` is the official address.** The other 13 all permanently
redirect to it. Everything in the code already assumes this: canonical URLs,
the sitemap, social cards, structured data and `llms.txt` all say
`https://labladies.com`.

### In Vercel — Sweet Dreams' projects → labladies-website → Settings → Domains

1. Add **`labladies.com`**. This is the production domain — no redirect.
2. Add **`www.labladies.com`** → *Redirect to* `labladies.com` (308).
3. Add each of these → *Redirect to* `labladies.com` (308). Add the `www.`
   version of any you expect people to type:

   | | |
   |---|---|
   | lab-ladies.com | lab-ladies.org |
   | labladies.net | lab-ladies.net |
   | labladies.org | labladies.info |
   | lab-ladies.info | labladies.xyz |
   | lab-ladies.xyz | labladies.store |
   | lab-ladies.store | labladies.shop |
   | lab-ladies.shop | |

### At GoDaddy — for every domain above

Use the exact records Vercel shows beside each domain once it is added. For a
standard setup that is an `A` record on `@` → `76.76.21.21` and a `CNAME` on
`www` → `cname.vercel-dns.com`. Delete GoDaddy's parked-page / forwarding
records on the same names first, or they will fight Vercel's.

### What the code does as a backstop

`next.config.ts` redirects every domain in `aliasDomains`
(`src/lib/site.ts`), plus its `www.`, to `https://labladies.com` with a 308 —
path and query string kept. So if a domain is added in Vercel without the
"Redirect to" setting, it still redirects instead of serving a duplicate copy
of the site that competes with the real one in Google. **A new domain has to
go in both places** — Vercel, and `aliasDomains`.

Any host that isn't `labladies.com` also gets `X-Robots-Tag: noindex`. That is
aimed at `labladies-website.vercel.app`: it keeps working (it's the way into
/admin until DNS settles, and it's where preview deploys live) but it stays
out of Google.

**After the switch, Michelle signs into /admin again** on labladies.com — the
login cookie belongs to the address she signed in on.

## 4. Google Search Console and Bing

Do this once `labladies.com` resolves.

**Google — use a Domain property, verified by DNS.** Search Console → Add
property → *Domain* → `labladies.com`. It gives a `TXT` record; add it at
whichever DNS host is authoritative for labladies.com (GoDaddy, unless you move
nameservers to Vercel). A Domain property covers `www.` and every other variant
at once and needs no code. Then:

1. Sitemaps → submit `sitemap.xml`.
2. URL Inspection → `https://labladies.com` → Request indexing.

Only if DNS verification isn't possible: use a URL-prefix property with the
*HTML tag* method, put the token (the `content="…"` value only) in Vercel as
`GOOGLE_SITE_VERIFICATION`, and redeploy. The layout emits the tag from that.

**Bing** (also feeds DuckDuckGo, Yahoo and ChatGPT search): Bing Webmaster
Tools → *Import from Google Search Console* once Google is verified. That is
the whole job. The fallback is `BING_SITE_VERIFICATION`, same pattern.

Don't add the 13 alias domains to Search Console. They redirect, and Google
follows the redirects on its own.

## 5. Google Business Profile

Not created yet. It is the single highest-value thing left for local search —
"mobile phlebotomist near me" is a map result before it is a web result. Once
it exists, replace the placeholder `site.googleReviewUrl` in
`src/lib/site.ts` with the real review link.

## 6. What Michelle should know

- `/admin` — email and password, then the board. Works on her phone.
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

## 7. Open items

- Rates for the pricing page (everything currently reads "Call for pricing").
- Confirm Dr. Lubin / Dr. Vega / Dr. Guia's practice affiliations.
- Carolyn Salowe's row has no lab recorded — her sheet just said "RL-".
- Next blog post due roughly 6 Oct 2026 to keep the fortnightly cadence.
