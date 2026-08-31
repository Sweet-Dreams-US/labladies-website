<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Lab Ladies — project facts

**Client:** Lab Ladies, LLC — Michelle Goldberg (RN, BSN, co-founder) and Sandra Semoy
(co-owner, Laboratory Supervisor). Nurse-owned concierge mobile laboratory service.

**Live URLs**
- Vercel prod: https://labladies-website.vercel.app
- Target domain: labladies.net (client owns several domains at GoDaddy; DNS not yet pointed)
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
