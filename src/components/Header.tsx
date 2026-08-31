"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PhoneIcon } from "@/components/Icons";
import { nav, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-cream-deep bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <Image
            src="/labladies-logo.png"
            alt=""
            width={768}
            height={640}
            priority
            className="h-10 w-auto shrink-0 sm:h-14"
          />
          <span className="min-w-0 leading-none">
            <span className="block truncate text-lg font-extrabold tracking-tight whitespace-nowrap sm:text-2xl">
              Lab Ladies
            </span>
            <span className="hidden whitespace-nowrap text-xs font-bold tracking-[0.14em] text-brand-ink uppercase xs:block sm:text-sm">
              Mobile Lab Services
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden items-center gap-0.5 xl:flex">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2.5 text-base font-bold whitespace-nowrap transition-colors ${
                  active ? "bg-cream text-brand-ink" : "text-ink hover:bg-cream"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <a
          href={site.phoneHref}
          className="ml-auto inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-brand px-4 text-base font-bold text-white transition-colors hover:bg-brand-deep sm:px-5 xl:ml-3"
        >
          <PhoneIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{site.phone}</span>
          <span className="sm:hidden">Call</span>
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-2 ring-cream-deep xl:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6">
            {open ? (
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="border-t border-cream-deep bg-white px-5 pb-4 xl:hidden"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-cream py-4 text-lg font-bold last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
