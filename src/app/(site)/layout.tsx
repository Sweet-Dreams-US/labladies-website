import { Analytics } from "@vercel/analytics/next";
import { CallBar } from "@/components/CallBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageviewTracker } from "@/components/PageviewTracker";
import { COUNTY_ORDER, areas } from "@/lib/areas";
import { getNav } from "@/lib/nav";
import { getSiteSettings } from "@/lib/settings";
import { site } from "@/lib/site";

/**
 * Chrome for the public site. /admin sits outside this group so the tracking
 * board doesn't render a header, footer and call-now bar over the top of it.
 */

/**
 * Site-wide structured data, as one linked graph.
 *
 * This is the half of "show up for mobile phlebotomist searches" that isn't
 * blog posts: it tells Google, Bing and the AI crawlers what this business is,
 * where it works and what it offers, without making them infer it from prose.
 *
 * Nodes reference each other by `@id`, so the blog's Article schema can point
 * its publisher at `#business` rather than restating the business every time.
 *
 * `areaServed` names the two counties because that is how people search — the
 * county, not a street address. There is deliberately no street address:
 * this is a service-area business that comes to the patient, and Google's
 * guidelines are to hide the address for those rather than publish one.
 */
const BUSINESS_ID = `${site.url}/#business`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["MedicalBusiness", "LocalBusiness"],
      "@id": BUSINESS_ID,
      name: site.name,
      alternateName: site.shortName,
      slogan: site.tagline,
      description:
        "Nurse-owned concierge mobile laboratory service providing specimen collection at home, in medical offices and in senior living communities across South Florida.",
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/icons/icon-512.png`,
        width: 512,
        height: 512,
      },
      image: `${site.url}/opengraph-image.png`,
      telephone: "+1-954-605-3725",
      faxNumber: "+1-561-461-6207",
      email: site.email,
      priceRange: "$$",
      currenciesAccepted: "USD",
      paymentAccepted: "Cash, Check, Credit Card",
      // The three counties, then every town with its own page — built from
      // lib/areas.ts, so a town added there is listed here too.
      areaServed: [
        ...COUNTY_ORDER.map((c) => ({ "@type": "AdministrativeArea", name: `${c} County, Florida` })),
        ...areas.map((a) => ({ "@type": "City", name: `${a.name}, Florida`, url: `${site.url}/areas/${a.slug}` })),
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
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-954-605-3725",
        contactType: "customer service",
        areaServed: "US-FL",
        availableLanguage: ["English"],
      },
      potentialAction: {
        "@type": "CommunicateAction",
        name: "Call Lab Ladies",
        target: site.phoneHref,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.shortName,
      inLanguage: "en-US",
      publisher: { "@id": BUSINESS_ID },
    },
  ],
};

/**
 * Adds the Google Business Profile, once Michelle has saved it, as the
 * business's `sameAs` and `hasMap`. That's the link that tells Google this
 * website and that Maps listing are the same business — which is what lets
 * the two rank together.
 */
function withProfile(graph: typeof jsonLd, settings: { google_business_url: string | null }) {
  if (!settings.google_business_url) return graph;
  const [business, ...rest] = graph["@graph"];
  return {
    ...graph,
    "@graph": [
      { ...business, sameAs: [settings.google_business_url], hasMap: settings.google_business_url },
      ...rest,
    ],
  };
}

// The Blog link and the blog pages depend on today's date in Fort Wayne, so
// every public page is rebuilt at least hourly and posts release without a deploy.
export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const navItems = getNav({ includeUnreleased: true });

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:font-bold focus:text-white"
      >
        Skip to content
      </a>
      <Header nav={navItems} />
      <main id="main">{children}</main>
      <Footer settings={settings} nav={navItems} />
      <CallBar />
      {/* Public pages only — the admin sits outside this layout, so Michelle's
          own clicks never count as visitors. */}
      <PageviewTracker />
      <Analytics />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(withProfile(jsonLd, settings)) }}
      />
    </>
  );
}
