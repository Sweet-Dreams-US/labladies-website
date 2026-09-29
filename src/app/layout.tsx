import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Search-engine ownership tags. Both optional, both from env so a token never
 * has to be committed or a redeploy spent adding one.
 *
 * The better route for Google is a Domain property verified by a DNS TXT
 * record, which needs no code at all and covers every subdomain — see
 * HANDOFF.md. These exist for the URL-prefix fallback.
 */
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Lab Ladies | Mobile Lab Services in South Florida",
    template: "%s | Lab Ladies",
  },
  description:
    "Nurse-owned mobile lab services in Fort Lauderdale, Miami, Boca Raton and across South Florida. Blood draws and PCR testing at home. Call 954-605-3725.",
  applicationName: site.shortName,
  keywords: [
    "mobile lab services",
    "mobile phlebotomist",
    "mobile phlebotomy South Florida",
    "mobile phlebotomist Fort Lauderdale",
    "mobile phlebotomist Miami",
    "mobile blood draw Broward County",
    "mobile blood draw Miami-Dade",
    "mobile blood draw Palm Beach",
    "home blood draw Boca Raton",
    "PCR testing at home",
    "urine PCR testing",
    "concierge mobile laboratory",
    "in-home lab work for seniors",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "health",
  // Deliberately NO `alternates.canonical` here. Set at the root it is
  // inherited by every page that forgets its own, and each of those would then
  // tell Google it is a duplicate of the homepage. The homepage sets "/"
  // itself; every other page sets its own path.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: "Lab Ladies | Mobile Lab Services — We Come to You",
    description:
      "Nurse-owned mobile lab services across Miami-Dade, Broward and Palm Beach County. Call or text 954-605-3725.",
    // The image itself comes from app/opengraph-image.png, which Next wires in
    // with the right size and type attributes automatically.
  },
  twitter: {
    card: "summary_large_image",
    title: "Lab Ladies | Mobile Lab Services — We Come to You",
    description:
      "Nurse-owned mobile lab services across Miami-Dade, Broward and Palm Beach County.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google show a full snippet and a large image preview. The defaults
      // are more conservative, and a small thumbnail loses clicks.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // iOS: the name under the icon when someone saves the site to their home
  // screen — likely for the admin, which Michelle uses on her phone.
  appleWebApp: {
    title: site.shortName,
    statusBarStyle: "default",
  },
  // formatDetection is deliberately left at the default. Turning off iOS
  // phone-number detection would stop the fax number becoming a tap-to-call,
  // but it would also strip the tap target from any plain-text mention of the
  // main number — and this site exists to get phone calls.
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
};

export const viewport: Viewport = {
  // Tints the browser chrome on Android Chrome and Safari to the brand red.
  themeColor: "#de0f0d",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  // No maximumScale: this audience zooms, and blocking pinch-zoom is an
  // accessibility failure.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
