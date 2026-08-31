import Image from "next/image";
import {
  BoltIcon,
  ClockIcon,
  DropIcon,
  partnerIcons,
  PinIcon,
  ShieldIcon,
  StarIcon,
} from "@/components/Icons";
import {
  Button,
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
import {
  appointmentWindows,
  partners,
  site,
  specializedServices,
  whoWeServe,
  whyChooseUs,
} from "@/lib/site";

const trustChips = [
  { icon: ClockIcon, title: "Quick Testing", note: "Appointments that fit your day" },
  { icon: BoltIcon, title: "Fast Results", note: "Often within 24–48 hours" },
  { icon: ShieldIcon, title: "Trusted Care", note: "Nurse-owned and operated" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-deep to-brand text-white">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold tracking-wide uppercase">
              <PinIcon className="h-4 w-4" />
              Palm Beach &amp; Broward County
            </p>
            <Heading as="h1">
              Mobile Lab Services.
              <span className="block text-cream">We Come to You!</span>
            </Heading>
            <p className="mt-5 max-w-2xl text-lg text-white/90 sm:text-xl">
              Lab Ladies, LLC is a nurse-owned concierge mobile laboratory service dedicated to
              serving older adults, concierge medical practices and senior living communities
              throughout South Florida.
            </p>
            <p className="mt-3 font-bold text-cream">
              Professional • Compassionate • Nurse-Led • Laboratory Expert
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CallButton variant="secondary" />
              <TextButton variant="ghost" />
            </div>
            <p className="mt-4 text-white/80">
              Save time. Skip the drive. Avoid waiting rooms.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="rounded-[2.5rem] bg-white/95 p-8 shadow-2xl">
              <Image
                src="/labladies-logo.png"
                alt="Lab Ladies mobile laboratory van"
                width={768}
                height={640}
                priority
                className="h-auto w-full max-w-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-cream-deep bg-cream">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8">
          {trustChips.map(({ icon: Icon, title, note }) => (
            <div key={title} className="flex items-center gap-4">
              <Icon className="h-10 w-10 shrink-0 text-brand" />
              <div>
                <p className="text-lg font-extrabold">{title}</p>
                <p className="text-muted">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why choose us */}
      <Section>
        <Eyebrow>Why Choose Lab Ladies</Eyebrow>
        <Heading>Personalized care from experienced professionals</Heading>
        <Lead className="mt-4">
          Our experienced nursing team and experienced laboratory supervisor work together to
          ensure every specimen is collected, handled and transported according to the highest
          clinical and laboratory standards.
        </Lead>
        <CheckList items={whyChooseUs} columns={2} className="mt-10" />
        <div className="mt-10">
          <SectionTab href="/about">Meet the Lab Ladies</SectionTab>
        </div>
      </Section>

      {/* Signature service: PCR */}
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
              <p className="mt-4 font-bold text-brand-ink">
                Rapid, often same-day results.
              </p>
              <div className="mt-8">
                <SectionTab href="/pcr-testing">Explore PCR Testing</SectionTab>
              </div>
            </div>
            <Card className="bg-white">
              <h3 className="text-xl font-extrabold">Our Specialized Services</h3>
              <CheckList items={specializedServices} columns={1} className="mt-6" />
            </Card>
          </div>
        </Section>
      </div>

      {/* Who we serve */}
      <Section>
        <Eyebrow>Who Uses Our Services</Eyebrow>
        <Heading>Care that comes to your door</Heading>
        <Lead className="mt-4">
          Whether you&rsquo;re at home, at the office or caring for a loved one, Lab Ladies brings
          professional laboratory collection directly to you.
        </Lead>
        <ul className="mt-10 flex flex-wrap gap-3">
          {whoWeServe.map((who) => (
            <li
              key={who}
              className="flex items-center gap-2 rounded-full bg-cream px-5 py-3 font-semibold"
            >
              <DropIcon className="h-4 w-4 text-brand" />
              {who}
            </li>
          ))}
        </ul>
      </Section>

      {/* Partners */}
      <div className="bg-cream">
        <Section>
          <Eyebrow>Who We Partner With</Eyebrow>
          <Heading>
            Bringing mobile lab services to providers, communities, campuses and businesses
          </Heading>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => {
              const Icon = partnerIcons[partner.icon];
              return (
                <Card key={partner.title}>
                  <Icon className="h-11 w-11 text-brand" />
                  <h3 className="mt-5 text-xl font-extrabold">{partner.title}</h3>
                  <CheckList items={partner.points} columns={1} className="mt-5" />
                </Card>
              );
            })}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <SectionTab href="/contact">Partner With Us</SectionTab>
            <CallButton variant="secondary" />
          </div>
        </Section>
      </div>

      {/* Appointments */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Offering Flexible Appointments</Eyebrow>
            <Heading>Scheduling that works around your life</Heading>
            <Lead className="mt-4">
              Early morning fasting appointments, evenings and weekends when available. Tell us
              what you need and we&rsquo;ll find a time that works.
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

      {/* Reviews */}
      <div className="bg-cream">
        <Section>
          <div className="flex flex-col items-center text-center">
            <div className="flex gap-1 text-brand">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} className="h-7 w-7" />
              ))}
            </div>
            <Heading className="mt-5">Cared for by Lab Ladies?</Heading>
            <Lead className="mt-4 text-center">
              Reviews help other families in South Florida find compassionate, nurse-led lab care.
              We&rsquo;d be grateful if you shared your experience.
            </Lead>
            <div className="mt-8">
              <Button href={site.googleReviewUrl} variant="primary">
                Leave a Google Review
              </Button>
            </div>
          </div>
        </Section>
      </div>

      {/* Final CTA */}
      <section className="bg-brand-deep px-5 py-16 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-3xl text-center">
          <Heading>Ready to schedule your mobile lab visit?</Heading>
          <p className="mt-4 text-lg text-white/90">
            Call or text us today — we serve Palm Beach and Broward County.
          </p>
          <p className="mt-6 text-4xl font-extrabold sm:text-5xl">
            <a href={site.phoneHref}>{site.phone}</a>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CallButton variant="secondary" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>
    </>
  );
}
