import type { Metadata } from "next";
import Link from "next/link";
import { CallButton, Eyebrow, Heading, Lead, Section, TextButton } from "@/components/ui";
import { COUNTY_INTRO, areasByCounty } from "@/lib/areas";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service Areas — Mobile Lab Across South Florida",
  description:
    "Mobile blood draws and PCR testing at home in Fort Lauderdale, Miami, Boca Raton and 40+ towns across Miami-Dade, Broward and Palm Beach County.",
  alternates: { canonical: "/areas" },
};

export default function AreasPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <Heading as="h1">Where We Come to You</Heading>
          <p className="mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
            Mobile lab collection across {site.areaLong} — at home, at work, or in your senior
            living community. {site.travelNote}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="ghost" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      {areasByCounty().map(({ county, areas }, i) => (
        <div key={county} className={i % 2 ? "bg-cream" : ""}>
          <Section>
            <Eyebrow>{county} County</Eyebrow>
            <Heading>{county}</Heading>
            <Lead className="mt-4">{COUNTY_INTRO[county]}</Lead>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/areas/${a.slug}`}
                    className="flex min-h-14 items-center justify-between rounded-2xl border border-cream-deep bg-white px-5 text-lg font-bold transition-colors hover:border-brand/40"
                  >
                    {a.name}
                    <span aria-hidden className="text-brand">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      ))}

      <Section>
        <div className="rounded-3xl bg-cream p-8 text-center">
          <Heading as="h3">Don&rsquo;t see your town?</Heading>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            These are the places we visit most, not the edge of the map. Call or text and we&rsquo;ll
            tell you straight away whether we can come to you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <CallButton />
            <TextButton />
          </div>
        </div>
      </Section>
    </>
  );
}
