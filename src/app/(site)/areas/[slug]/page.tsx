import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/Accordion";
import {
  CallButton,
  CheckList,
  Eyebrow,
  Heading,
  Lead,
  Section,
  SectionTab,
  TextButton,
} from "@/components/ui";
import { COUNTY_INTRO, areas, getArea } from "@/lib/areas";
import { appointmentWindows, services, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }));
}

/** Keep the rendered title under ~60 characters so Google shows it whole. */
function titleFor(name: string) {
  const long = `Mobile Phlebotomist in ${name}, FL`;
  return long.length <= 46 ? long : `Mobile Blood Draw in ${name}, FL`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) return {};
  return {
    title: titleFor(area.name),
    description: `A nurse comes to you in ${area.name} for blood draws and PCR testing — at home, at work or in senior living. Call ${site.phone}.`,
    alternates: { canonical: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const nearby = area.nearby.map(getArea).filter((a) => a !== null);
  const url = `${site.url}/areas/${area.slug}`;

  const faq = [
    {
      q: `Do you really come to ${area.name}?`,
      a: `Yes. A Lab Ladies nurse comes to your home, office or senior living community in ${area.name}, collects the specimen there, and takes it to an accredited reference laboratory. Call or text ${site.phone} to book.`,
    },
    {
      q: `Is there a travel fee to ${area.name}?`,
      a: "Sometimes, depending on the address. We always confirm any travel fee before the appointment — never after.",
    },
    {
      q: "Do I need a doctor's order?",
      a: "Not always. Many tests are available self-pay with no physician order needed. Others are collected on an order from your physician or practitioner. Ask when you call and we'll tell you which applies.",
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: `Mobile lab services in ${area.name}, FL`,
      serviceType: "Mobile phlebotomy and specimen collection",
      provider: { "@id": `${site.url}/#business` },
      areaServed: {
        "@type": "City",
        name: `${area.name}, Florida`,
        containedInPlace: { "@type": "AdministrativeArea", name: `${area.county} County, Florida` },
      },
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Service Areas", item: `${site.url}/areas` },
        { "@type": "ListItem", position: 3, name: area.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/areas"
            className="text-sm font-bold tracking-[0.14em] text-white/80 uppercase hover:text-white"
          >
            ← {area.county} County
          </Link>
          <Heading as="h1" className="mt-5">
            Mobile Blood Draws in {area.name}
          </Heading>
          <p className="mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">{area.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="secondary" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>In {area.name}</Eyebrow>
        <Heading>What we collect at your door</Heading>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.slug}>
              <Link
                href={"href" in s && s.href ? s.href : `/services#${s.slug}`}
                className="block h-full rounded-2xl border border-cream-deep bg-white p-6 transition-colors hover:border-brand/40"
              >
                <p className="text-lg font-bold">{s.title}</p>
                <p className="mt-1 text-muted">{s.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <div className="bg-cream">
        <Section>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <Eyebrow>Appointments</Eyebrow>
              <Heading>On your schedule</Heading>
              <Lead className="mt-4">
                Early-morning fasting draws are standard, with evenings and weekends when
                available. {site.travelNote}
              </Lead>
              <CheckList items={appointmentWindows} columns={2} className="mt-6" />
            </div>
            <div>
              <Eyebrow>{area.county} County</Eyebrow>
              <Heading>Across the county</Heading>
              <Lead className="mt-4">{COUNTY_INTRO[area.county]}</Lead>
              {nearby.length > 0 && (
                <>
                  <p className="mt-6 font-bold">Also near {area.name}:</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {nearby.map((n) => (
                      <li key={n.slug}>
                        <Link
                          href={`/areas/${n.slug}`}
                          className="inline-flex min-h-11 items-center rounded-full bg-white px-4 font-semibold ring-1 ring-inset ring-cream-deep hover:ring-brand/40"
                        >
                          {n.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </Section>
      </div>

      <Section>
        <div className="mx-auto max-w-3xl">
          <Heading>Common questions</Heading>
          <div className="mt-6 space-y-3">
            {faq.map((f) => (
              <Accordion key={f.q} title={f.q}>
                <p>{f.a}</p>
              </Accordion>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <SectionTab href="/services">See every service</SectionTab>
          </div>
        </div>
      </Section>

      <section className="bg-brand-deep px-5 py-16 text-white sm:px-8">
        <div className="mx-auto w-full max-w-3xl text-center">
          <Heading>Book a visit in {area.name}</Heading>
          <p className="mt-6 text-4xl font-extrabold sm:text-5xl">
            <a href={site.phoneHref}>{site.phone}</a>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CallButton variant="secondary" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
