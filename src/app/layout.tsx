import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
