import type { ReactNode } from "react";

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-cream-deep bg-white open:shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-lg font-bold marker:hidden [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          viewBox="0 0 24 24"
          aria-hidden
          className="h-6 w-6 shrink-0 text-brand transition-transform group-open:rotate-180"
        >
          <path
            d="m6 9.5 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </summary>
      <div className="space-y-4 border-t border-cream px-6 py-5 text-muted">{children}</div>
    </details>
  );
}
