import { Anton } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import type { SiteSettings } from "@/lib/settings";
import { site } from "@/lib/site";
import type { NavItem } from "@/lib/site";

// Only the credit line uses it, so only the Latin subset of one weight loads.
const anton = Anton({ subsets: ["latin"], weight: "400", display: "swap" });

export function Footer({ settings, nav }: { settings: SiteSettings; nav: readonly NavItem[] }) {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/labladies-logo.png"
              alt=""
              width={768}
              height={640}
              className="h-14 w-auto"
            />
            <span className="text-2xl font-extrabold">Lab Ladies</span>
          </div>
          <p className="mt-4 text-white/75">{site.longTagline}</p>
        </div>

        <div>
          <h2 className="text-lg font-bold">Contact</h2>
          <ul className="mt-4 space-y-3 text-white/85">
            <li>
              <a href={site.phoneHref} className="flex items-center gap-3 hover:text-white">
                <PhoneIcon className="h-5 w-5 text-brand" />
                <span className="text-xl font-bold">{site.phone}</span>
              </a>
            </li>
            <li>
              <a href={site.emailHref} className="flex items-center gap-3 break-all hover:text-white">
                <MailIcon className="h-5 w-5 shrink-0 text-brand" />
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <PinIcon className="h-5 w-5 shrink-0 text-brand" />
              {site.areaShort} Counties, FL
            </li>
            <li className="pl-8 text-sm text-white/60">Fax: {site.fax}</li>
            {settings.google_business_url && (
              <li className="pl-8">
                <a href={settings.google_business_url} className="text-sm text-white/85 underline hover:text-white">
                  Find us on Google
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold">Pages</h2>
          <ul className="mt-4 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/85 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/areas" className="text-white/85 hover:text-white">
                Service Areas
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 text-sm text-white/55 sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved. {site.travelNote}{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
          </p>
          {/*
            Must agree with the pricing page. Both kinds of patient are true:
            self-pay tests need no physician order, and the practices that
            send Lab Ladies work send it with one.
          */}
          <p className="mt-2">
            Lab Ladies provides mobile specimen collection and transport. Laboratory testing is
            performed by accredited reference laboratories. Many tests are available self-pay with
            no physician order needed; others are collected on an order from your physician or
            practitioner.
          </p>
          <p className="mt-4 text-white/60">
            Designed and built by{" "}
            <a
              href="https://sweetdreams.us"
              className={`${anton.className} text-base tracking-wide text-white/90 uppercase hover:text-white`}
            >
              Sweet Dreams
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
