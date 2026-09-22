"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/tracking", label: "Tracking" },
  { href: "/admin/practices", label: "Practices" },
  { href: "/admin/labs", label: "Labs" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/activity", label: "Activity" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cream-deep bg-white/95 backdrop-blur">
      {/*
        Two rows on a phone — logo and sign-out, then the links beneath — so
        the six links wrap as a block instead of orbiting the logo. One row
        from `sm` up, where they all fit.
      */}
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link href="/admin" className="flex shrink-0 items-center gap-2">
          <Image
            src="/labladies-logo.png"
            alt="Lab Ladies"
            width={120}
            height={48}
            className="h-9 w-auto"
          />
          <span className="sr-only">Lab Ladies admin</span>
        </Link>

        <nav className="-mx-1 order-last flex w-full flex-wrap items-center gap-1 sm:order-none sm:w-auto sm:flex-1">
          {links.map((l) => {
            // "/admin" must only light up on an exact match, or every page
            // would show two active tabs.
            const active = l.href === "/admin" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                  active ? "bg-brand text-white" : "text-muted hover:bg-cream hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={signOut}
          className="ml-auto rounded-lg px-3 py-2 text-sm font-bold text-muted transition-colors hover:bg-cream hover:text-ink sm:ml-0"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
