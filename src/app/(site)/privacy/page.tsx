import type { Metadata } from "next";
import { Heading, Section } from "@/components/ui";
import { site } from "@/lib/site";

/**
 * Privacy policy.
 *
 * Written to describe what THIS site actually does — every processor named
 * here is one the code really uses. When a new service is added (a chat
 * widget, an ad pixel, a booking tool), this page has to change with it.
 * Not legal advice; the client's attorney should review it.
 */

const EFFECTIVE = "September 29, 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.shortName} handles the information you share through this website.`,
  alternates: { canonical: "/privacy" },
};

const sections: { h: string; body: React.ReactNode }[] = [
  {
    h: "What this policy covers",
    body: (
      <p>
        This policy covers the website at {site.url.replace("https://", "")} — what it collects,
        why, and who helps us run it. Information about your health that we receive while providing
        care — at a visit, from your physician, or from a laboratory — is not collected through
        this website and is handled separately, in line with the laws that apply to it.
      </p>
    ),
  },
  {
    h: "What you tell us through the callback form",
    body: (
      <>
        <p>
          If you ask us to call you back, we receive the details you type in: your name, phone
          number, email address, how you prefer to be contacted, who the request is for, the
          service you&rsquo;re interested in, your general area, any message you add, and which
          page of the site you sent it from.
        </p>
        <p>
          We use this only to get back to you and arrange your visit. Please don&rsquo;t include
          medical details in the form — we&rsquo;ll go through everything on the phone.
        </p>
      </>
    ),
  },
  {
    h: "What we record automatically",
    body: (
      <>
        <p>
          To understand which pages are useful, we count visits. For each page view we record the
          page, the site that linked you here (for example, Google), your country, and whether you
          were on a phone, tablet or computer.
        </p>
        <p>
          We do not use cookies for this, we do not build a profile of you, and we do not store your
          IP address. To count unique visitors, we use an anonymous code that is scrambled with a
          key that changes every day — so it can&rsquo;t be used to recognize you from one day to
          the next.
        </p>
      </>
    ),
  },
  {
    h: "Cookies",
    body: (
      <p>
        The public website does not set advertising or tracking cookies. The only cookie we use is a
        sign-in cookie for our own staff area, which visitors never see.
      </p>
    ),
  },
  {
    h: "Who helps us run the site",
    body: (
      <>
        <p>A small number of service providers process information on our behalf:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Vercel</strong> hosts the website and, like any web host, briefly processes the
            technical details of each request (such as IP address) to deliver the page. We also use
            Vercel&rsquo;s privacy-friendly, cookie-free analytics.
          </li>
          <li>
            <strong>Supabase</strong> stores callback requests securely in the United States.
          </li>
          <li>
            <strong>Resend</strong> delivers the email that tells us a callback request has arrived.
          </li>
          <li>
            <strong>Cloudflare Turnstile</strong> checks that forms are sent by a person rather
            than an automated program. To do that it looks at information about your browser and
            connection. It does not require cookies and is not used for advertising.
          </li>
        </ul>
        <p>
          We do not sell your information, share it for advertising, or use advertising pixels on
          this site.
        </p>
      </>
    ),
  },
  {
    h: "How long we keep it",
    body: (
      <p>
        We keep callback requests for as long as we need them to respond and to keep ordinary
        business records. Visit counts are kept only in the anonymous, summarized form described
        above.
      </p>
    ),
  },
  {
    h: "Your choices",
    body: (
      <p>
        You can ask us what information we hold from this website, ask us to correct it, or ask us
        to delete it. Email{" "}
        <a href={site.emailHref} className="font-semibold text-brand-ink underline">
          {site.email}
        </a>{" "}
        or call{" "}
        <a href={site.phoneHref} className="font-semibold text-brand-ink underline">
          {site.phone}
        </a>
        .
      </p>
    ),
  },
  {
    h: "Changes",
    body: (
      <p>
        If we change how this website handles information, we&rsquo;ll update this page and the date
        below.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <Heading as="h1">Privacy Policy</Heading>
          <p className="mt-4 text-white/85">Effective {EFFECTIVE}</p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl space-y-10">
          <p className="text-lg">
            {site.name} (&ldquo;Lab Ladies&rdquo;, &ldquo;we&rdquo;) is a mobile laboratory
            collection service in South Florida. This page explains, in plain terms, how we handle
            information you share through this website.
          </p>
          {sections.map((s) => (
            <div key={s.h} className="space-y-3 text-lg leading-relaxed">
              <h2 className="text-2xl font-extrabold tracking-tight">{s.h}</h2>
              {s.body}
            </div>
          ))}
          <p className="border-t border-cream-deep pt-6 text-muted">
            {site.name} · {site.phone} · {site.email}
          </p>
        </div>
      </Section>
    </>
  );
}
