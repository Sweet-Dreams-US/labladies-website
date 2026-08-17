import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CallBar } from "@/components/CallBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Lab Ladies | Mobile Lab Services in Palm Beach & Broward",
    template: "%s | Lab Ladies",
  },
  description:
    "Nurse-owned concierge mobile laboratory services in Palm Beach and Broward County. Blood draws, PCR testing and lab collection at your home or facility. Call 954-605-3725.",
  keywords: [
    "mobile lab services",
    "mobile phlebotomy South Florida",
    "mobile blood draw Palm Beach",
    "mobile lab Broward County",
    "PCR testing at home",
    "concierge mobile laboratory",
  ],
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: "Lab Ladies | Mobile Lab Services — We Come to You",
    description:
      "Nurse-owned concierge mobile laboratory services across Palm Beach and Broward County. Call or text 954-605-3725.",
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: site.name,
  description:
    "Nurse-owned concierge mobile laboratory service providing specimen collection at home, in medical offices and in senior living communities across South Florida.",
  url: site.url,
  telephone: "+1-954-605-3725",
  faxNumber: "+1-561-461-6207",
  email: site.email,
  areaServed: [
    { "@type": "AdministrativeArea", name: "Palm Beach County, Florida" },
    { "@type": "AdministrativeArea", name: "Broward County, Florida" },
  ],
  address: { "@type": "PostalAddress", addressRegion: "FL", addressCountry: "US" },
  medicalSpecialty: "Pathology",
  availableService: [
    "Mobile blood draw",
    "Advanced PCR testing collection",
    "Culture and sensitivity collection",
    "Drug testing",
    "Blood typing",
    "STD rapid testing",
  ].map((name) => ({ "@type": "MedicalTest", name })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
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
      </body>
    </html>
  );
}
