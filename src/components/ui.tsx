import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowIcon, CheckIcon, ChatIcon, PhoneIcon } from "@/components/Icons";
import { site } from "@/lib/site";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-5 py-16 sm:px-8 md:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-sm font-bold tracking-[0.18em] text-brand-ink uppercase">
      {children}
    </p>
  );
}

export function Heading({
  children,
  as: As = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const size =
    As === "h1"
      ? "text-4xl sm:text-5xl lg:text-6xl"
      : As === "h2"
        ? "text-3xl sm:text-4xl"
        : "text-xl sm:text-2xl";
  return (
    <As className={`font-extrabold tracking-tight text-balance ${size} ${className}`}>
      {children}
    </As>
  );
}

export function Lead({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`max-w-3xl text-lg text-muted sm:text-xl ${className}`}>{children}</p>;
}

type ButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = {
    primary:
      "bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-deep active:bg-brand-deep",
    secondary:
      "bg-white text-brand-ink ring-2 ring-inset ring-brand/30 hover:ring-brand hover:bg-cream",
    ghost: "bg-white/15 text-white ring-2 ring-inset ring-white/50 hover:bg-white/25",
  }[variant];
  return (
    <Link
      {...props}
      className={`inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full px-7 text-lg font-bold transition-colors ${styles} ${className}`}
    />
  );
}

export function CallButton({
  variant = "primary",
  className = "",
  label,
}: {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  label?: string;
}) {
  return (
    <Button href={site.phoneHref} variant={variant} className={className}>
      <PhoneIcon className="h-5 w-5" />
      {label ?? `Call ${site.phone}`}
    </Button>
  );
}

export function TextButton({
  variant = "secondary",
  className = "",
}: {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return (
    <Button href={site.smsHref} variant={variant} className={className}>
      <ChatIcon className="h-5 w-5" />
      Text Us
    </Button>
  );
}

export function CheckList({
  items,
  columns = 2,
  className = "",
}: {
  items: readonly string[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const cols = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" }[columns];
  return (
    <ul className={`grid gap-x-8 gap-y-4 ${cols} ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <CheckIcon className="mt-1 h-6 w-6 shrink-0 text-brand" />
          <span className="font-medium">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Card({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-3xl border border-cream-deep bg-white p-7 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

/** The "blue tab under each section" pattern the client called out on sites they like. */
export function SectionTab({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-14 items-center gap-2 rounded-full bg-brand-deep px-7 text-lg font-bold text-white transition-colors hover:bg-brand"
    >
      {children}
      <ArrowIcon />
    </Link>
  );
}
