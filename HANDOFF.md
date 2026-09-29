# Lab Ladies — deployment & handoff

Everything below is what has to happen outside the code for the tracking board
and the blog to be live.

**Status:** live at **<https://www.labladies.com>** — the official domain
since 29 Sep 2026. Every .net address redirects there. The
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
| `NEXT_PUBLIC_SITE_URL` | `https://www.labladies.com` | The official domain — see §3 before changing |
| `ADMIN_EMAIL` | `labladies2026@gmail.com` | The email half of the sign-in |
| `ADMIN_PASSCODE` | in `.env.local` | The password half |
| `ALERT_EMAIL_TO` | `labladies2026@gmail.com` | Where overdue alerts go |
| `ALERT_FROM` | `Lab Ladies <notifications@labladies.net>` | labladies.net is verified in Resend |
| `RESEND_API_KEY` | set 25 Sep 2026 | **Sending-only key, scoped to labladies.net.** It cannot send as any other client's domain — never swap in an account-wide key |
| `CRON_SECRET` | set | Vercel signs the nightly cron with it |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | set 29 Sep 2026 | Cloudflare Turnstile — see §2b |
| `TURNSTILE_SECRET_KEY` | set 29 Sep 2026 | Cloudflare Turnstile — see §2b |

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

## 2. Email notifications — ON (25 Sep 2026)

Resend is live. `labladies.net` is verified (its records sit on the `send`,
`rsend` and `resend._domainkey` subdomains, clear of the Microsoft 365 email
on the root), and mail goes out as `Lab Ladies <notifications@labladies.net>`
to `labladies2026@gmail.com`:

- **Every callback-form submission**, the moment it arrives. Reply goes to the
  person who filled it in; there's a one-tap Call button and a link to the admin.
- **The overdue digest**, weekdays 8am ET — only when something is actually
  overdue, and each item only once.

`RESEND_API_KEY` is a **sending-only key scoped to labladies.net**, created for
this project. The account-wide key Cole pasted can see and send for every
client domain; it was not put in this project, and since it has been shared in
chat it should be rotated in Resend.

Testing locally never emails Michelle: `.env.local` sends to
`delivered@resend.dev`, Resend's sandbox inbox.

## 2b. Bot protection (Cloudflare Turnstile) — ON (29 Sep 2026)

Live on both public-facing forms — the callback form and the admin sign-in.
The forms *inside* the admin don't need it: every save there already requires
a signed-in session, and the sign-in is what Turnstile guards.

**If anyone ever reports they can't sign in or send the form**, the fastest
way back is to remove `TURNSTILE_SECRET_KEY` from Vercel and redeploy —
enforcement switches off and everything works as it did before Turnstile.

1. Cloudflare → Turnstile → the widget. **Hostnames:** `www.labladies.com`,
   `labladies.com`, and `labladies-website.vercel.app` (still a way into
   /admin). Mode: **Managed**.
2. Vercel → Environment Variables, all environments:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the **Site key**
   - `TURNSTILE_SECRET_KEY` = the **Secret key**
3. **Redeploy** — the site key is baked in at build time, so saving the
   variable alone does nothing.
4. Check: submit the form on the live site; it should say thank you. Sign out
   and back into /admin.

How it behaves: invisible for nearly everyone (it only shows a checkbox to a
visitor Cloudflare finds suspicious). A missing, invalid or reused token is
refused before anything is stored or any password compared. If Cloudflare is
unreachable, or the secret is wrong, the submission goes through and the
problem is logged — a real person asking for a blood draw shouldn't be turned
away by a third-party outage or a typo in Vercel. It only enforces when *both*
keys are set, so a half-finished setup can't lock anyone out of the admin.

## 3. Domains

**`https://www.labladies.com` is the official address** (since 29 Sep 2026).

Set in Vercel as **`NEXT_PUBLIC_SITE_URL`** — canonical tags, the sitemap,
social cards, structured data, `llms.txt` and the redirects all follow it.

> **The one rule:** `NEXT_PUBLIC_SITE_URL` must be the domain Vercel marks
> **Production** — never one Vercel itself redirects. Vercel sends
> `labladies.com` → `www.labladies.com`, so the setting is
> `https://www.labladies.com`. Naming the bare domain would make Vercel and
> the site redirect visitors back and forth forever. Change one, change both,
> then redeploy.

**What's attached to the Vercel project today**

| Domain | Does |
|---|---|
| `www.labladies.com` | **Production** — serves the site |
| `labladies.com` | 308 → www.labladies.com |
| `labladies.net`, `www.labladies.net` | 308 → www.labladies.com |
| `labladies-website.vercel.app` | Serves the site, noindexed |

**The other domains** (`lab-ladies.com`, `.org`, `.info`, `.xyz`, `.store`,
`.shop`…) aren't attached. Either works for each:
- GoDaddy Forwarding → `https://www.labladies.com` (what `lab-ladies.net` does), or
- point its DNS at Vercel and add it to the project, *Redirect to*
  `www.labladies.com`. If the redirect setting is forgotten, the code
  redirects it anyway — as long as it's in `ownedDomains` in `src/lib/site.ts`.

**Removing a domain from the project doesn't stop its DNS pointing at
Vercel** — visitors then get a Vercel "deployment not found" 404. Remove the
DNS record too, or keep the domain attached as a redirect. That's what took
.net down for a few days in late September.

> **Don't touch the email records on labladies.net.** Its DNS carries a live
> Microsoft 365 setup with Proofpoint filtering — `MX`, `autodiscover`,
> `lyncdiscover`, `sip`, `msoid`, the `_sip…` SRVs and the SPF / DMARC /
> `onmicrosoft.com` TXT records. The Resend records (`send`, `rsend`,
> `resend._domainkey`) are the notification email. Leave the nameservers at
> GoDaddy.

**Michelle signs into /admin again** at `www.labladies.com/admin` — the login
cookie belongs to the address she signed in on.

## 4. Google Search Console and Bing

Do this now, for **labladies.com**.

**Google — use a Domain property, verified by DNS.** Search Console → Add
property → *Domain* → `labladies.com`. It gives a `TXT` record; add it at
GoDaddy, alongside the existing records. A Domain property covers `www.` and every other variant
at once and needs no code. Then:

1. Sitemaps → submit `sitemap.xml`.
2. URL Inspection → `https://www.labladies.com` → Request indexing.

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
