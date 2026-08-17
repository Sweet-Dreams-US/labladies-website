import Image from "next/image";
import Link from "next/link";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { nav, site } from "@/lib/site";

export function Footer() {
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
              Palm Beach &amp; Broward Counties, FL
            </li>
            <li className="pl-8 text-sm text-white/60">Fax: {site.fax}</li>
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
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 text-sm text-white/55 sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved. {site.travelNote}
          </p>
          <p className="mt-2">
            Lab Ladies provides mobile specimen collection and transport. Laboratory testing is
            performed by accredited reference laboratories. Testing requires an order from your
            physician or practitioner.
          </p>
        </div>
      </div>
    </footer>
  );
}
