import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, ClockIcon, DropIcon } from "@/components/Icons";
import {
  CallButton,
  Card,
  CheckList,
  Eyebrow,
  Heading,
  Lead,
  Section,
  SectionTab,
  TextButton,
} from "@/components/ui";
import { appointmentWindows, services, site, specializedServices } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mobile Blood Draws & Lab Services",
  description:
    "Mobile blood draws, PCR testing, culture & sensitivity, drug and STD testing — collected at your home or facility in Palm Beach and Broward County.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <Heading as="h1">Our Services</Heading>
          <p className="mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
            Concierge mobile laboratory collection for older adults, concierge medical practices
            and senior living communities — performed by experienced Registered Nurses and backed
            by experienced laboratory leadership.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="secondary" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.slug} id={service.slug} className="flex flex-col scroll-mt-28">
              <DropIcon className="h-9 w-9 text-brand" />
              <h2 className="mt-4 text-2xl font-extrabold">{service.title}</h2>
              <p className="mt-1 font-bold text-brand-ink">{service.summary}</p>
              <p className="mt-4 text-muted">{service.body}</p>
              <CheckList items={service.points} columns={1} className="mt-6" />
              {"href" in service && service.href ? (
                <Link
                  href={service.href}
                  className="mt-6 inline-flex items-center gap-2 self-start text-lg font-bold text-brand-ink underline underline-offset-4"
                >
                  Learn more about PCR testing
                  <ArrowIcon />
                </Link>
              ) : null}
            </Card>
          ))}
        </div>
      </Section>

      {/* Specialty pointer */}
      <div className="bg-cream">
        <Section>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Eyebrow>Our Specialty</Eyebrow>
              <Heading>Advanced PCR Diagnostic Collection</Heading>
              <Lead className="mt-4">
                PCR molecular testing is what sets Lab Ladies apart — including specialized urine
                PCR collection for patients who cannot provide a clean-catch specimen.
              </Lead>
              <div className="mt-8">
                <SectionTab href="/pcr-testing">Explore PCR Testing</SectionTab>
              </div>
            </div>
            <Card className="bg-white">
              <h2 className="text-xl font-extrabold">Our Specialized Services</h2>
              <CheckList items={specializedServices} columns={1} className="mt-6" />
            </Card>
          </div>
        </Section>
      </div>

      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Offering Flexible Appointments</Eyebrow>
            <Heading>We work around your schedule</Heading>
            <Lead className="mt-4">
              Early morning fasting appointments, evenings and weekends when available.
            </Lead>
            <p className="mt-4 font-semibold text-muted">{site.travelNote}</p>
            <div className="mt-8">
              <SectionTab href="/pricing">See Pricing</SectionTab>
            </div>
          </div>
          <Card className="bg-cream">
            <ClockIcon className="h-11 w-11 text-brand" />
            <CheckList items={appointmentWindows} columns={1} className="mt-6" />
            <div className="mt-8 flex flex-wrap gap-3">
              <CallButton />
              <TextButton />
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
