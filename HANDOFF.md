# Lab Ladies — deployment & handoff

Everything below is what has to happen outside the code for the tracking board
and the blog to be live.

**Status:** live at **<https://www.labladies.net>** — the official domain for
now. **labladies.com** is the intended long-term home but can't be pointed
yet (see §3). The
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
| `NEXT_PUBLIC_SITE_URL` | `https://www.labladies.net` | The official domain — see §3 before changing |
| `ADMIN_EMAIL` | `labladies2026@gmail.com` | The email half of the sign-in |
| `ADMIN_PASSCODE` | in `.env.local` | The password half |
| `ALERT_EMAIL_TO` | `labladies2026@gmail.com` | Where overdue alerts go |
| `ALERT_FROM` | `Lab Ladies <onboarding@resend.dev>` | Switch to `alerts@labladies.net` once verified in Resend |
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
2. Verify `labladies.net` in Resend (add its records alongside the Microsoft
   365 ones — don't replace them), then change `ALERT_FROM` to
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

## 3. Domains

**Today: `https://www.labladies.net` is the official address.** Every other
owned domain redirects to it. `labladies.com` will take over once it can be
pointed at Vercel.

The official address is one setting — **`NEXT_PUBLIC_SITE_URL`** in Vercel —
not code. Canonical tags, the sitemap, social cards, structured data,
`llms.txt` and the redirects all follow it. The list of owned domains is
`ownedDomains` in `src/lib/site.ts`; whichever one `NEXT_PUBLIC_SITE_URL` names
is served, and the rest (plus every `www.`) 308 to it.

> **The one rule:** `NEXT_PUBLIC_SITE_URL` must be the domain Vercel marks
> **Production** — never one Vercel itself redirects. Vercel currently sends
> `labladies.net` → `www.labladies.net`, so the setting is
> `https://www.labladies.net`. If it said `https://labladies.net`, Vercel and
> the site would redirect visitors back and forth forever.

### Switching to labladies.com, when it's possible

It can't be pointed today: its nameservers are `ns5/ns6.afternic.com` —
GoDaddy's lease/marketplace service — so its DNS isn't editable like the
others. That's tied to the lease. Once GoDaddy lets you manage its DNS:

1. At GoDaddy, point `labladies.com` at Vercel (the records Vercel shows).
2. In Vercel → Domains, add `labladies.com` as **Production** and
   `www.labladies.com` → redirect to it. Wait for *Valid Configuration*.
3. **Check <https://labladies.com> shows the site.** Not before — pointing the
   site at .com while it's still parked sends every visitor to a blank page.
   That happened for a short while on 25 Sep.
4. Set `NEXT_PUBLIC_SITE_URL` = `https://labladies.com` (all environments).
5. Redeploy. The .net domains now 308 to .com, which carries the ranking over.
6. In Search Console, add a Domain property for labladies.com as well.

### Adding the other domains

Each one either points its DNS at Vercel and is added in Vercel with
*Redirect to* `www.labladies.net`, or uses GoDaddy's own Forwarding (as
`lab-ladies.net` does) to `https://www.labladies.net`. Both work. Pointing at
Vercel is slightly better — one hop instead of two — and the code redirects
any owned domain that reaches Vercel even if its "Redirect to" isn't set.

> **Don't touch the email records on labladies.net.** Its DNS carries a live
> Microsoft 365 setup with Proofpoint filtering — the `MX`, `autodiscover`,
> `lyncdiscover`, `sip`, `msoid` and `_sip…` records and the SPF / DMARC /
> `onmicrosoft.com` TXT records. Only the `A @` and `CNAME www` records are
> the website. Leave the nameservers at GoDaddy too; moving them to Vercel
> would drop those records unless every one is recreated first.

Any host that isn't the official one also gets `X-Robots-Tag: noindex` —
mainly `labladies-website.vercel.app`, which keeps working (preview deploys,
and a way into /admin) without competing in Google.

**After any domain switch, Michelle signs into /admin again** on the new
address — the login cookie belongs to the address she signed in on.

## 4. Google Search Console and Bing

Do this now, for **labladies.net**.

**Google — use a Domain property, verified by DNS.** Search Console → Add
property → *Domain* → `labladies.net`. It gives a `TXT` record; add it at
GoDaddy, alongside the existing records. A Domain property covers `www.` and every other variant
at once and needs no code. Then:

1. Sitemaps → submit `sitemap.xml`.
2. URL Inspection → `https://www.labladies.net` → Request indexing.

Only if DNS verification isn't possible: use a URL-prefix property with the
*HTML tag* method, put the token (the `content="…"` value only) in Vercel as
`GOOGLE_SITE_VERIFICATION`, and redeploy. The layout emits the tag from that.

**Bing** (also feeds DuckDuckGo, Yahoo and ChatGPT search): Bing Webmaster
Tools → *Import from Google Search Console* once Google is verified. That is
the whole job. The fallback is `BING_SITE_VERIFICATION`, same pattern.

Don't add the other domains to Search Console. They redirect, and Google
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
