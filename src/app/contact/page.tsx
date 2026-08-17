import type { Metadata } from "next";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, StarIcon } from "@/components/Icons";
import {
  Button,
  CallButton,
  Card,
  CheckList,
  Eyebrow,
  Heading,
  Lead,
  Section,
  TextButton,
} from "@/components/ui";
import { appointmentWindows, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call or text Lab Ladies at 954-605-3725 to schedule mobile lab collection in Palm Beach and Broward County. Email labladies2026@gmail.com.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-6xl text-center">
          <Heading as="h1">Call or Text Us Today</Heading>
          <p className="mt-5 text-lg text-white/90 sm:text-xl">
            The fastest way to schedule is a phone call. We&rsquo;ll answer your questions and find
            a time that works.
          </p>
          <p className="mt-8 text-4xl font-extrabold sm:text-6xl">
            <a href={site.phoneHref}>{site.phone}</a>
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CallButton variant="secondary" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <PhoneIcon className="h-10 w-10 text-brand" />
            <h2 className="mt-4 text-xl font-extrabold">Phone &amp; Text</h2>
            <a
              href={site.phoneHref}
              className="mt-3 block text-2xl font-extrabold text-brand-ink"
            >
              {site.phone}
            </a>
            <p className="mt-2 text-muted">Fax: {site.fax}</p>
          </Card>

          <Card>
            <MailIcon className="h-10 w-10 text-brand" />
            <h2 className="mt-4 text-xl font-extrabold">Email</h2>
            <a
              href={site.emailHref}
              className="mt-3 block font-bold break-all text-brand-ink"
            >
              {site.email}
            </a>
            <p className="mt-2 text-muted">
              Send orders, questions or facility inquiries any time.
            </p>
          </Card>

          <Card>
            <PinIcon className="h-10 w-10 text-brand" />
            <h2 className="mt-4 text-xl font-extrabold">Service Area</h2>
            <p className="mt-3 font-bold text-brand-ink">South Florida</p>
            <p className="mt-2 text-muted">
              Palm Beach County and Broward County. {site.travelNote}
            </p>
          </Card>

          <Card className="md:col-span-2">
            <ClockIcon className="h-10 w-10 text-brand" />
            <h2 className="mt-4 text-xl font-extrabold">Flexible Appointments</h2>
            <p className="mt-2 text-muted">
              Early morning fasting appointments, plus evenings and weekends when available.
            </p>
            <CheckList items={appointmentWindows} columns={2} className="mt-6" />
          </Card>

          <Card className="bg-cream">
            <div className="flex gap-1 text-brand">
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} className="h-6 w-6" />
              ))}
            </div>
            <h2 className="mt-4 text-xl font-extrabold">Already a client?</h2>
            <p className="mt-2 text-muted">
              A quick review helps other South Florida families find us.
            </p>
            <Button href={site.googleReviewUrl} className="mt-6 w-full">
              Review Us on Google
            </Button>
          </Card>
        </div>
      </Section>

      <div className="bg-cream">
        <Section>
          <Eyebrow>Before You Call</Eyebrow>
          <Heading>What to have ready</Heading>
          <Lead className="mt-4">
            Having a few details on hand helps us schedule your visit quickly.
          </Lead>
          <CheckList
            items={[
              "The lab order from your physician or practitioner",
              "The patient's name, date of birth and address",
              "Any fasting requirements on the order",
              "A phone number for the ordering provider",
              "Facility contact, if the visit is at an ALF or nursing community",
            ]}
            columns={2}
            className="mt-10"
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <CallButton />
            <TextButton />
          </div>
        </Section>
      </div>
    </>
  );
}
