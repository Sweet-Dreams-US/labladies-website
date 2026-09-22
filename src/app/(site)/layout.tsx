import { CallBar } from "@/components/CallBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/site";

/**
 * Chrome for the public site. /admin sits outside this group so the tracking
 * board doesn't render a header, footer and call-now bar over the top of it.
 */

/**
 * Site-wide MedicalBusiness schema.
 *
 * This is the half of "show up for mobile phlebotomist searches" that isn't
 * blog posts: it tells Google and the AI crawlers what this business is,
 * where it works and what it offers, in a form they don't have to infer from
 * prose. `areaServed` carries the two counties by name because that is how
 * people actually search — the county, not a street address.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "@id": `${site.url}/#business`,
  name: site.name,
  alternateName: site.shortName,
  slogan: site.tagline,
  description:
    "Nurse-owned concierge mobile laboratory service providing specimen collection at home, in medical offices and in senior living communities across South Florida.",
  url: site.url,
  telephone: "+1-954-605-3725",
  faxNumber: "+1-561-461-6207",
  email: site.email,
  priceRange: "$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, Check, Credit Card",
  areaServed: [
    { "@type": "AdministrativeArea", name: "Palm Beach County, Florida" },
    { "@type": "AdministrativeArea", name: "Broward County, Florida" },
  ],
  address: { "@type": "PostalAddress", addressRegion: "FL", addressCountry: "US" },
  medicalSpecialty: "Pathology",
  knowsAbout: [
    "Mobile phlebotomy",
    "Mobile blood draw",
    "Difficult venipuncture",
    "Urine PCR testing collection",
    "Respiratory PCR collection",
    "Geriatric specimen collection",
    "Medical courier services",
  ],
  availableService: [
    "Mobile blood draw",
    "Advanced PCR testing collection",
    "Culture and sensitivity collection",
    "Drug testing",
    "STD rapid testing",
    "Gender reveal DNA testing",
    "Medical courier services",
  ].map((name) => ({ "@type": "MedicalTest", name })),
  potentialAction: {
    "@type": "CommunicateAction",
    name: "Call Lab Ladies",
    target: site.phoneHref,
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CallBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
