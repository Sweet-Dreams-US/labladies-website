import type { Metadata } from "next";
import { CheckIcon, ClockIcon, PinIcon, ShieldIcon } from "@/components/Icons";
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
import { pricing, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Lab Ladies pricing — self-pay mobile lab collection in Palm Beach and Broward County. No physician order needed for self-pay testing. Call 954-605-3725 for current rates.",
  alternates: { canonical: "/pricing" },
};

const policyIcons = [ShieldIcon, CheckIcon, PinIcon];

export default function PricingPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <Heading as="h1">Pricing</Heading>
          <p className="mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">{pricing.headline}</p>
          <p className="mt-3 max-w-3xl text-white/85">
            Call or text us for current rates on any service. We will confirm your total —
            including any travel fee — before we schedule your visit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="secondary" label={`Call for Pricing — ${site.phone}`} />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      {/* How billing works */}
      <Section>
        <Eyebrow>How Billing Works</Eyebrow>
        <Heading>Straightforward, and explained up front</Heading>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {pricing.policies.map((policy, i) => {
            const Icon = policyIcons[i] ?? ShieldIcon;
            return (
              <Card key={policy.title}>
                <Icon className="h-10 w-10 text-brand" />
                <h2 className="mt-4 text-xl font-extrabold">{policy.title}</h2>
                <p className="mt-3 text-muted">{policy.body}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Rate table */}
      <div className="bg-cream">
        <Section>
          <Eyebrow>Our Services</Eyebrow>
          <Heading>What we can collect for you</Heading>
          <Lead className="mt-4">
            Rates vary by test and location. Give us a call and we will give you an exact price for
            what you need.
          </Lead>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse overflow-hidden rounded-2xl bg-white text-left">
              <thead>
                <tr className="bg-brand-deep text-white">
                  <th scope="col" className="px-6 py-4 text-lg font-extrabold">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-4 text-lg font-extrabold">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricing.rows.map((row) => (
                  <tr key={row.service} className="border-b border-cream last:border-0">
                    <th scope="row" className="px-6 py-4 font-semibold">
                      {row.service}
                    </th>
                    <td className="px-6 py-4">
                      {row.price ?? (
                        <a href={site.phoneHref} className="font-bold text-brand-ink underline">
                          Call for pricing
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 font-semibold text-muted">{site.travelNote}</p>
        </Section>
      </div>

      {/* Self-pay explainer */}
      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Self-Pay Testing</Eyebrow>
            <Heading>You can order testing yourself</Heading>
            <Lead className="mt-4">
              With self-pay testing you do not need an order from a doctor. Call us, tell us what
              you are looking for, and we will schedule a nurse to come to you.
            </Lead>
            <div className="mt-8">
              <SectionTab href="/services">See All Services</SectionTab>
            </div>
          </div>
          <Card className="bg-cream">
            <ClockIcon className="h-11 w-11 text-brand" />
            <h2 className="mt-4 text-xl font-extrabold">What to expect</h2>
            <CheckList
              items={[
                "Call or text to tell us what you need",
                "We confirm the price and any travel fee up front",
                "A Registered Nurse comes to your home or facility",
                "Your specimen goes to an accredited reference laboratory",
                "We follow through until the results are delivered",
              ]}
              columns={1}
              className="mt-6"
            />
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
