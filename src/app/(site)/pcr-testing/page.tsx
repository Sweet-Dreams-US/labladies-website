import type { Metadata } from "next";
import { Accordion } from "@/components/Accordion";
import { BoltIcon, DropIcon, ShieldIcon } from "@/components/Icons";
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
import { site, specializedServices } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advanced PCR Testing",
  description:
    "Advanced molecular PCR collection across South Florida — urine, respiratory, wound and GI PCR, including specialized collection for patients who cannot provide a clean-catch specimen. Call 954-605-3725.",
  alternates: { canonical: "/pcr-testing" },
};

const pcrPanels = [
  {
    title: "Urine PCR",
    body: "For complicated and recurrent urinary tract infections, where traditional culture may not identify every organism.",
  },
  {
    title: "Respiratory PCR",
    body: "Flu, COVID, RSV, Strep and other respiratory pathogens — collected on site, with rapid turnaround.",
  },
  {
    title: "Wound PCR",
    body: "Molecular identification for wounds that are slow to heal or not responding to treatment.",
  },
  {
    title: "GI PCR",
    body: "Gastrointestinal pathogen panels, including C. diff.",
  },
];

const pcrEligible = [
  "Residents of Assisted Living Facilities (ALFs)",
  "Memory Care residents",
  "Skilled Nursing Facility residents",
  "Bedbound patients",
  "Patients with urinary incontinence",
  "Patients unable to provide a clean-catch urine specimen",
];

const whyPcr = [
  { icon: BoltIcon, title: "Rapid Results", note: "Often same day." },
  { icon: ShieldIcon, title: "Molecular Precision", note: "Identifies organisms culture can miss." },
  { icon: DropIcon, title: "Collected At Home", note: "No waiting room, no travel." },
];

export default function PcrTestingPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold tracking-wide uppercase">
            Our Signature Specialty
          </p>
          <Heading as="h1">Advanced PCR Testing</Heading>
          <p className="mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
            PCR molecular diagnostics are what set Lab Ladies apart. Our experienced Registered
            Nurses and experienced Laboratory Supervisor collect, handle and transport every
            specimen according to the performing laboratory&rsquo;s requirements.
          </p>
          <p className="mt-3 font-bold text-cream">Rapid, often same-day results.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="secondary" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      <div className="border-b border-cream-deep bg-cream">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8">
          {whyPcr.map(({ icon: Icon, title, note }) => (
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

      <Section>
        <Eyebrow>What We Collect</Eyebrow>
        <Heading>PCR panels we collect for</Heading>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {pcrPanels.map((panel) => (
            <Card key={panel.title}>
              <DropIcon className="h-9 w-9 text-brand" />
              <h2 className="mt-4 text-2xl font-extrabold">{panel.title}</h2>
              <p className="mt-3 text-muted">{panel.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <div className="bg-cream">
        <Section id="urine-pcr">
          <Eyebrow>Specialized Collection</Eyebrow>
          <Heading>Urine PCR Collection for Incontinent Patients</Heading>
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
              <h2 className="text-xl font-extrabold">Our Specialized Services</h2>
              <CheckList items={specializedServices} columns={1} className="mt-6" />
              <div className="mt-8">
                <SectionTab href="/contact">Talk to a Nurse</SectionTab>
              </div>
            </Card>
          </div>
        </Section>
      </div>

      <section className="bg-brand-deep px-5 py-16 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-3xl text-center">
          <Heading>Questions about PCR collection?</Heading>
          <p className="mt-4 text-lg text-white/90">
            Providers and facility staff are welcome to call us directly — we will walk through the
            right collection method for your patient.
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
