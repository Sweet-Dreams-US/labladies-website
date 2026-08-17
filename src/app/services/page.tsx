import type { Metadata } from "next";
import { Accordion } from "@/components/Accordion";
import { ClockIcon, DropIcon } from "@/components/Icons";
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
  title: "Mobile Lab Services & PCR Testing",
  description:
    "Mobile blood draws, culture & sensitivity, advanced PCR testing, drug testing, blood typing and STD rapid testing — collected at your home or facility in Palm Beach and Broward County.",
  alternates: { canonical: "/services" },
};

const pcrEligible = [
  "Residents of Assisted Living Facilities (ALFs)",
  "Memory Care residents",
  "Skilled Nursing Facility residents",
  "Bedbound patients",
  "Patients with urinary incontinence",
  "Patients unable to provide a clean-catch urine specimen",
];

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

      {/* Service list */}
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.slug} id={service.slug} className="scroll-mt-28">
              <DropIcon className="h-9 w-9 text-brand" />
              <h2 className="mt-4 text-2xl font-extrabold">{service.title}</h2>
              <p className="mt-1 font-bold text-brand-ink">{service.summary}</p>
              <p className="mt-4 text-muted">{service.body}</p>
              <CheckList items={service.points} columns={1} className="mt-6" />
            </Card>
          ))}
        </div>
      </Section>

      {/* Signature PCR section with details */}
      <div className="bg-cream">
        <Section id="urine-pcr">
          <Eyebrow>Signature Service</Eyebrow>
          <Heading>Specialized Urine PCR Collection for Incontinent Patients</Heading>
          <Lead className="mt-4">
            At Lab Ladies, we understand that obtaining a clean urine specimen can be challenging
            for patients with urinary incontinence, limited mobility, dementia or other medical
            conditions.
          </Lead>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <Accordion title="How diaper swab PCR collection works" defaultOpen>
                <p>
                  When appropriate and in accordance with the performing laboratory&rsquo;s
                  collection protocols, we can collect specimens using diaper swab collection for
                  select molecular PCR urine tests. This innovative collection method may help
                  avoid the discomfort and inconvenience associated with obtaining a traditional
                  urine sample in certain patients.
                </p>
                <p>
                  Our experienced nursing team follows laboratory-approved collection procedures to
                  help ensure specimen integrity and accurate testing.
                </p>
              </Accordion>

              <Accordion title="Who this option may benefit">
                <CheckList items={pcrEligible} columns={1} className="text-ink" />
              </Accordion>

              <Accordion title="Helping physicians care for their most challenging patients">
                <p>
                  Obtaining urine specimens from incontinent patients can often delay diagnosis and
                  treatment. Lab Ladies offers collection solutions designed to improve access to
                  advanced molecular PCR testing for patients who cannot provide a clean-catch
                  urine specimen.
                </p>
                <p>
                  Our experienced nurses work closely with healthcare providers and facility staff
                  to determine the most appropriate collection method based on the patient&rsquo;s
                  condition and the laboratory&rsquo;s testing requirements.
                </p>
              </Accordion>

              <Accordion title="Why this matters">
                <p>
                  Patients with recurrent urinary tract infections, dementia, limited mobility or
                  urinary incontinence are often the very patients who benefit from advanced PCR
                  diagnostics — but they can also be the most difficult to collect specimens from.
                </p>
                <p>
                  Our specialized collection techniques help make advanced molecular testing more
                  accessible while maintaining patient dignity, comfort and convenience.
                </p>
              </Accordion>

              <Accordion title="Clinical expertise you can trust">
                <p>
                  Our experienced Registered Nurses and experienced Laboratory Supervisor are
                  knowledgeable in specimen collection requirements for advanced molecular
                  diagnostics, helping ensure that specimens are collected, handled and transported
                  according to laboratory guidelines.
                </p>
              </Accordion>
            </div>

            <Card className="h-fit">
              <h3 className="text-xl font-extrabold">Our Specialized Services</h3>
              <CheckList items={specializedServices} columns={1} className="mt-6" />
              <div className="mt-8">
                <SectionTab href="/contact">Talk to a Nurse</SectionTab>
              </div>
            </Card>
          </div>
        </Section>
      </div>

      {/* Appointments */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Offering Flexible Appointments</Eyebrow>
            <Heading>We work around your schedule</Heading>
            <Lead className="mt-4">
              Early morning fasting appointments, evenings and weekends when available.
            </Lead>
            <p className="mt-4 font-semibold text-muted">{site.travelNote}</p>
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
