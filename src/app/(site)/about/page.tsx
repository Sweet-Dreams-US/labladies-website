import type { Metadata } from "next";
import Image from "next/image";
import { DropIcon } from "@/components/Icons";
import {
  CallButton,
  Card,
  CheckList,
  Eyebrow,
  Heading,
  Lead,
  Section,
  SectionTab,
} from "@/components/ui";
import { site, whyChooseUs } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Lab Ladies is nurse-owned and operated by Michelle G., RN, BSN and Sandra S., a laboratory supervisor with 25+ years of experience serving South Florida.",
  alternates: { canonical: "/about" },
};

const founders = [
  {
    name: "Michelle G., RN, BSN",
    role: "Co-Founder · Registered Nurse",
    paragraphs: [
      "My name is Michelle, and I have dedicated the past 30 years to caring for older adults and helping patients and their families navigate the complexities of healthcare.",
      "Throughout my career in geriatric nursing and case management, I have specialized in patient advocacy, medication management, care coordination, and patient and family education. I am passionate about communicating healthcare information in a way that is easy to understand, empowering patients and their loved ones to make informed decisions and feel confident in their care.",
      "I am a Registered Nurse with a Bachelor of Science in Nursing (BSN), licensed to practice nursing in Florida and New York, and I hold a multi-state Compact Nursing License, allowing me to provide nursing services across participating compact states.",
      "After three decades in nursing, my commitment remains the same: to provide compassionate, personalized care, build trusted relationships, and improve the overall healthcare experience for every patient and family we encounter.",
    ],
  },
  {
    name: "Sandra S.",
    role: "Co-Owner · Laboratory Supervisor",
    paragraphs: [
      "Hello, I'm Sandra, co-owner of Lab Ladies.",
      "I have over 25 years of experience in healthcare, with my primary focus in laboratory services. Throughout my career, I have served as a Laboratory Supervisor, gaining extensive experience in every aspect of the laboratory process — from specimen collection and patient care to specimen processing and ensuring accurate, timely results are delivered to physicians to support diagnosis and treatment.",
      "My passion has always been providing exceptional service while treating every patient with professionalism, compassion, and respect.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Heading as="h1">About Lab Ladies</Heading>
            <p className="mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
              {site.longTagline}
            </p>
            <p className="mt-4 max-w-3xl text-white/85">
              Lab Ladies, LLC is a mobile laboratory company created to make diagnostic services
              more convenient, accessible and patient-centered. Our mission is to bring reliable
              laboratory testing directly to patients, concierge medical practices and the
              communities we serve, while removing barriers that often make healthcare more
              difficult to access.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-[2.5rem] bg-white/95 p-8 shadow-2xl">
              <Image
                src="/labladies-logo.png"
                alt="Lab Ladies mobile laboratory van"
                width={768}
                height={640}
                className="h-auto w-full max-w-xs"
              />
            </div>
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>Meet the Owners</Eyebrow>
        <Heading>Two professionals. One standard of care.</Heading>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {founders.map((person) => (
            <Card key={person.name}>
              <DropIcon className="h-9 w-9 text-brand" />
              <h2 className="mt-4 text-2xl font-extrabold">{person.name}</h2>
              <p className="mt-1 font-bold text-brand-ink">{person.role}</p>
              <div className="mt-5 space-y-4 text-muted">
                {person.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <div className="bg-cream">
        <Section>
          <Eyebrow>Our Promise</Eyebrow>
          <Heading>What every visit includes</Heading>
          <CheckList items={whyChooseUs} columns={2} className="mt-10" />
          <div className="mt-10 flex flex-wrap gap-3">
            <SectionTab href="/services">See Our Services</SectionTab>
            <CallButton variant="secondary" />
          </div>
        </Section>
      </div>

      <Section>
        <div className="rounded-3xl bg-ink px-7 py-12 text-center text-white sm:px-12">
          <Heading>&ldquo;We come to you.&rdquo;</Heading>
          <Lead className="mx-auto mt-4 text-center text-white/80">
            Serving Palm Beach and Broward County with early morning, evening and weekend
            availability. {site.travelNote}
          </Lead>
          <div className="mt-8 flex justify-center">
            <CallButton variant="secondary" />
          </div>
        </div>
      </Section>
    </>
  );
}
