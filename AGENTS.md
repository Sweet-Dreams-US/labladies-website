<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Lab Ladies — project facts

**Client:** Lab Ladies, LLC — Michelle Goldberg (RN, BSN, co-founder) and Sandra Semoy
(co-owner, Laboratory Supervisor). Nurse-owned concierge mobile laboratory service.

**Live URLs**
- **Official domain: https://labladies.com** (decided 25 Sep 2026). It is a
  *leased* domain at GoDaddy — see HANDOFF.md.
- 13 alias domains 308-redirect to it; the list is `aliasDomains` in
  `src/lib/site.ts` and `next.config.ts` builds the redirects from it.
- Vercel: project `labladies-website` in the **Sweet Dreams' projects** team,
  Git-connected — pushes to `main` deploy to production.
  https://labladies-website.vercel.app stays live but is noindexed.
- Repo: https://github.com/Sweet-Dreams-US/labladies-website

**NAP — never change without client sign-off**
- Phone / text: 954-605-3725 · Fax: 561-461-6207 · Email: labladies2026@gmail.com
- Service area: Palm Beach County & Broward County, South Florida

**Brand**
- Reds sampled from the client rack card: `#DE0F0D` (brand), `#9D0201` (brand-deep),
  `#8E0906` (brand-ink, for red text on white). Cream `#FDF6EC`. Ink `#1A1512`.
- Logo: `public/labladies-logo.png`, extracted from the client's `Lab Ladies Logo PNG.pdf`
  (transparent RGBA). Source PDFs live in `../../` (the LabLadies business folder).

**Content rules**
- Site goal is **phone calls** plus Google reviews. Every page keeps a call CTA above the
  fold; a fixed call/text bar is pinned on mobile.
- Primary audience is **geriatric patients and their caregivers** — keep base type large
  (17px mobile / 18px desktop), tap targets ≥ 48px, contrast high. Do not shrink these.
- **No IV therapy content.** The client explicitly had it removed from the prior build.
- PCR testing is the signature service and must stay prominent (home section +
  `/services#urine-pcr` with the diaper-swab collection detail in accordions).
- Diaper-swab PCR claims must stay hedged ("when appropriate and in accordance with the
  performing laboratory's collection protocols") — the client's own note flags this.
- No AI-generated people or hands anywhere. The site is currently photo-free by design;
  if the client sends real photos, drop them in `public/` and add them as brand slots.
- `site.googleReviewUrl` in `src/lib/site.ts` is a search-URL placeholder — swap for the
  real Google Business Profile review link once the profile exists.
- **Owners are named by first name + last initial only** (Michelle G., Sandra S.). Do not
  publish their surnames anywhere on the site.
- **Say what we do, never what we don't.** No "we don't treat X" phrasing anywhere. In
  particular, pediatrics is out of scope — handle that by simply not mentioning children,
  never by stating an exclusion.
- **No children anywhere.** No kids, no families-with-young-children, no pediatric copy.
- **No blood typing** — removed at the client's request.
- **Gender reveal DNA testing is an active service** and should stay listed.
- **No "workplace collections"** as an audience or service — the Medical Courier offering
  covers contracted pickups instead.
- Audiences to reflect: senior living communities, concierge medical practices, older
  adults, universities, med spas, gyms, plus medical courier clients.
- **Pricing page rules:** self-pay means **no physician order is needed**; Lab Ladies
  **does not bill insurance** (the performing laboratory does its own billing); a travel
  fee may apply. Rates live in `pricing.rows` in `src/lib/site.ts` — each row renders
  "Call for pricing" until `price` is set to a string.

**Design references the client named**
- mobilephlebotomyservicesfl.com — "a tab under each section that takes you to another
  page" → implemented as the `SectionTab` component.
- onestickusa.com — clean, not wordy.

**Stack:** Next 16 · React 19 · Tailwind 4 · TypeScript · App Router with `src/`.
All copy lives in `src/lib/site.ts` plus the page files; there is no CMS.

---

# The admin / tracking board (`/admin`)

Replaces the shared Google Doc Michelle was keeping by hand. Added after the
14 Sep 2026 call; the columns mirror her sheet deliberately so she recognises
it.

**THE SCOPE RULE — read before adding any field.** This tracks the *business
process* around a collection, never its clinical content. The **type** of test
is stored. A test **result** never is: `results_received` / `results_sent` are
yes/no workflow flags, exactly as her sheet had them. There is nowhere in the
schema, the types or the API whitelist to put a value, reading, report or
diagnosis, and it must stay that way — it is what keeps this system out of
scope for the PHI questions Michelle raised on the call. Notes fields say
"process notes only" for the same reason. The enforcement point is
`ENCOUNTER_FIELDS` in `src/lib/encounter-fields.ts`: routes whitelist against
it rather than spreading the request body.

**Data lives in the shared `FreeWebsites` Supabase project** (`nxhwqtqroyerbbklywyn`),
under the `ll_` prefix, following the same convention as `fwr_` / `ec_` / `cnc_`:

- Every `ll_` table has RLS on with **no public policy at all** — unlike the
  other sites there is no "public can insert" path, because nothing on the
  public website writes here.
- Access is the publishable key **plus** the `x-admin-token` header, checked in
  RLS by `private.ll_request_is_admin()`. The publishable key alone reads
  nothing. **Deliberately not a service-role key** — that would bypass RLS on
  every other client's tables in the shared project.
- `SUPABASE_ADMIN_TOKEN` and `ADMIN_PASSCODE` are server-only. Never prefix
  either `NEXT_PUBLIC_`.

**The lab distinction drives the whole UI.** From Michelle's note: My Clinical
and GSB are local reference labs — she has chart access and owes results to the
ordering practitioner. Quest and Labcorp run on the ordering provider's own
account and she loses all access at drop-off. So when `lab.is_reference_lab` is
false the board **hides** the results follow-up fields and never raises an
overdue alert. Do not "fix" that by showing them: chasing a Quest result is
chasing something she cannot see.

**Alerts.** `computeAlerts()` in `src/lib/tracking.ts` is the single source of
truth, used by both the dashboard and the nightly email, so the board never
disagrees with the inbox. Thresholds are `ALERT_DAYS`. `ll_alerts_sent`
de-duplicates so each encounter/rule emails once; completing the step clears
the mark so a later stall can alert again. The cron is in `vercel.json`
(weekdays 12:00 UTC = 8am ET) and needs `CRON_SECRET` + `RESEND_API_KEY` set in
Vercel. Without `RESEND_API_KEY` alerts log instead of sending, and do **not**
get marked as sent.

**Auth** is one shared passcode → HMAC cookie (`src/lib/admin-auth.ts`), the
house pattern. 8-hour session rather than the usual 12, because this board
carries patient names and gets used on a phone. Who drew the blood is recorded
as data on the encounter, not inferred from the login.

**Edit in place.** Michelle came from a spreadsheet, where changing a cell
means clicking it and typing. Making her open a form to fix one date was the
clearest way this could have felt worse than the Google Doc it replaced, so
almost every cell is editable in the row — on the desktop table and on the
phone cards. `InlineFields.tsx` holds the pieces; the rules are: dropdowns and
dates save on change, text and numbers save on blur or Enter (never per
keystroke), Escape reverts, and a failed save puts the old value back rather
than leaving something on screen that isn't in the database. The full form is
still there for the fields that don't belong in a row — test types, the
results dates, the sticks flags in one place. `allowEmpty={false}` on an
InlineSelect is for columns the database always has a value for; without it
you get a duplicate option that means the same as one already in the list.

The patient column is `sticky` — scrolling right to reach Notes must not cost
you the name of the person the row is about.

# Inquiries (`/admin/inquiries`)

The site was built phone-call-first and had no form at all. `ll_inquiries`
plus `InquiryForm` adds the second path, for people who won't ring. The phone
number stays the primary CTA everywhere; the form sits *below* it on
`/contact`, never above.

- `ll_inquiries` is the one `ll_` table with a public write policy, because
  the form posts with the bare publishable key. The `with check` pins what a
  stranger may set, so a submission cannot arrive pre-marked "booked" or
  carrying admin notes. Reading anything back still needs the admin token.
- Same scope rule: no DOB field, no clinical field. `message` is free text a
  stranger types, so the form asks them not to put medical details in it and
  the admin repeats that. Do not add fields that invite more.
- There is a honeypot (`company`). A filled one returns 200 and stores
  nothing, so a bot learns nothing from the response.
- The API stores first, then emails. A mail outage still leaves the lead in
  /admin; a database outage still sends the email.
- Marking anything past "new" stamps `contacted_at` automatically and clears
  the alert mark. She should not have to tell the system what time it is.

**`ll_alerts_sent.entity_id`** is deliberately not a foreign key: it points at
either `ll_encounters` or `ll_inquiries` depending on the rule. Nothing
cascades, so deletes call `clearAllAlertMarks` explicitly.

**Route groups:** public pages live in `src/app/(site)/` with the header /
footer / call-bar chrome; `/admin` sits outside it so the tracking board
doesn't render a "Call Now" bar over itself.

**Server → Client boundary:** the reference pages are Server Components and
`ReferenceEditor` is a Client Component, so badges and subtitles are computed
server-side and passed as *data*. Passing them as render functions throws at
runtime and the build will not catch it.

# Blog & SEO

Added for the "keep us near the top for mobile phlebotomist" ask on the call.

- Posts are typed data in `src/lib/blog.ts`, not a CMS — same as the rest of
  the copy. Append an entry; `date` drives ordering and the sitemap.
- Cadence is every other week. Posts exist to answer what people type before
  they call.
- All the site content rules above apply to posts: say what we do and never
  what we don't, no children or pediatric copy, no naming third-party
  laboratories as partners, hedge the diaper-swab PCR claim, and never state
  or imply what a result means.
- `faq` on a post renders both as accordions and as FAQPage schema.

# SEO & metadata plumbing

Every piece of this is a Next file convention or `metadata` export; there is
no SEO library.

- **Canonicals.** The root layout deliberately sets *no* canonical — set there,
  it is inherited by any page that forgets its own, and that page then tells
  Google it's a duplicate of the homepage. Every page sets its own
  `alternates.canonical`. A new page must too.
- **Titles** stay under ~60 characters rendered (including " | Lab Ladies")
  and lead with the service and the place. Descriptions under ~158.
- **Icons:** `app/favicon.ico` (16/32/48 — 48 is what Google's search-result
  favicon wants), `app/icon.png` (192, a multiple of 48 for the same reason),
  `app/apple-icon.png` (180, *opaque* — iOS paints transparency black), and
  the manifest icons in `public/icons/` (the maskable one keeps the logo inside
  the 80% safe zone). All generated from `public/labladies-logo.png`.
- **Share images:** `app/opengraph-image.png` / `twitter-image.png` site-wide;
  `blog/[slug]/opengraph-image.tsx` renders a per-post card with the headline,
  at build, using the vendored `src/assets/fonts/Inter-ExtraBold.ttf`. Next
  appends a hash to generated image routes, so **never hand-write a URL to the
  per-post image** — schema uses the stable site-wide PNG for that reason.
- **Structured data** is one `@graph` in `(site)/layout.tsx` with `#business`
  and `#website` nodes. Blog posts reference them by `@id` rather than
  restating the business. No street address on purpose: service-area business.
- **`/llms.txt`** is a plain summary for AI assistants, built from the same
  data as the pages.
- **Verification** tags come from `GOOGLE_SITE_VERIFICATION` /
  `BING_SITE_VERIFICATION` env vars, and are only the fallback — a DNS-verified
  Domain property is the recommended route.
- **`siteUpdated`** in `site.ts` is what the sitemap reports for the static
  pages. Bump it when page copy changes. Don't swap it for `new Date()`.

# Still outstanding

- **Domains** → Cole is adding them in Vercel and GoDaddy. See `HANDOFF.md`.
- **Search Console / Bing Webmaster** — once labladies.com resolves.
- **Google Business Profile** does not exist yet; `site.googleReviewUrl` is
  still a search-URL placeholder.
- **Pricing** rows are all `null` ("Call for pricing") pending Michelle's rates.
- Dr. Lubin, Dr. Vega and Dr. Guia were seeded from her sheet but were not on
  her list of seven practices — practice affiliation needs confirming.
- Carolyn Salowe's row has no lab recorded; her original sheet just said "RL-".
