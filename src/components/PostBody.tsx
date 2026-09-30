import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "@/components/Icons";
import { Button } from "@/components/ui";
import type { Block } from "@/lib/blog-markdown";

const linkClass =
  "font-semibold text-brand-ink underline decoration-brand/40 underline-offset-4 hover:text-brand hover:decoration-brand";

const INLINE =
  /\[([^\]]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|(?<![*\w])\*(?!\s)(.+?)(?<!\s)\*(?![*\w])|`([^`]+)`/g;

function Anchor({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={linkClass}>
        {children}
      </Link>
    );
  }
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
      </a>
    );
  }
  if (/^(mailto|tel|sms):/i.test(href)) {
    return (
      <a href={href} className={linkClass}>
        {children}
      </a>
    );
  }
  // Anything else (javascript:, data:, a bare word) is shown as plain text.
  return <>{children}</>;
}

/** Bold, italic, code and links inside a line of text. Never produces raw HTML. */
export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    if (m[1] !== undefined) {
      out.push(
        <Anchor key={key++} href={m[2]}>
          <Inline text={m[1]} />
        </Anchor>,
      );
    } else if (m[3] !== undefined) {
      out.push(
        <strong key={key++}>
          <Inline text={m[3]} />
        </strong>,
      );
    } else if (m[4] !== undefined) {
      out.push(
        <em key={key++}>
          <Inline text={m[4]} />
        </em>,
      );
    } else if (m[5] !== undefined) {
      out.push(
        <code key={key++} className="rounded bg-cream px-1.5 py-0.5 text-[0.9em]">
          {m[5]}
        </code>,
      );
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const isSafeHref = (href: string) =>
  (href.startsWith("/") && !href.startsWith("//")) || /^(https?:\/\/|mailto:|tel:|sms:)/i.test(href);

/**
 * A tip's links leave the text and become buttons under it. Every link in the
 * tip is taken, in order; the text keeps whatever was around them.
 */
function splitTipLinks(blocks: Block[]) {
  const links: { label: string; href: string }[] = [];
  const rest: Block[] = [];
  for (const b of blocks) {
    if (b.t !== "p") {
      rest.push(b);
      continue;
    }
    const text = b.text
      .replace(LINK, (_, label: string, href: string) => {
        if (isSafeHref(href)) links.push({ label, href });
        return "";
      })
      .replace(/\s+/g, " ")
      .trim();
    if (text) rest.push({ t: "p", text });
  }
  return { rest, links };
}

function TipButton({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:\/\//i.test(href);
  return (
    <Button
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="w-full text-center sm:w-auto"
    >
      {children}
      <ArrowIcon className="h-5 w-5 shrink-0" />
    </Button>
  );
}

function Callout({ block }: { block: Extract<Block, { t: "callout" }> }) {
  const tip = block.kind === "tip";
  const { rest, links } = tip ? splitTipLinks(block.blocks) : { rest: block.blocks, links: [] };
  return (
    <aside
      className={`rounded-3xl border-l-8 p-6 sm:p-7 ${
        tip
          ? "border-brand bg-cream"
          : "border-ink bg-white shadow-sm ring-2 ring-cream-deep ring-inset"
      }`}
    >
      <p
        className={`text-sm font-bold tracking-[0.14em] uppercase ${
          tip ? "text-brand-ink" : "text-ink"
        }`}
      >
        {tip ? "Tip" : "Note"}
      </p>
      <p className="mt-1 text-xl font-extrabold tracking-tight text-balance sm:text-2xl">
        {block.title}
      </p>
      <div className="mt-3 space-y-4">
        <Blocks blocks={rest} />
      </div>
      {links.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {links.map((l) => (
            <TipButton key={l.href + l.label} href={l.href}>
              {l.label}
            </TipButton>
          ))}
        </div>
      )}
    </aside>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.t) {
          case "h2":
            return (
              <h2
                key={i}
                id={block.id || undefined}
                className="scroll-mt-28 pt-4 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="pt-2 text-xl font-extrabold tracking-tight text-balance sm:text-2xl"
              >
                {block.text}
              </h3>
            );
          case "list":
            return (
              <ul key={i} className="space-y-3 pl-1">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-3">
                {block.items.map((item, n) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-base font-extrabold text-brand-ink"
                    >
                      {n + 1}
                    </span>
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-brand bg-cream py-5 pl-6 text-lg font-semibold text-balance sm:text-xl"
              >
                <Inline text={block.text} />
              </blockquote>
            );
          case "callout":
            return <Callout key={i} block={block} />;
          case "image": {
            const src = block.src.replace(/^\.?\/?images\//, "/blog/images/");
            if (!src.startsWith("/blog/images/")) return null;
            return (
              <figure key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={block.alt}
                  loading="lazy"
                  className="h-auto w-full rounded-3xl border border-cream-deep"
                />
              </figure>
            );
          }
          case "hr":
            return <hr key={i} className="border-cream-deep" />;
          default:
            return (
              <p key={i} className="text-lg leading-relaxed">
                <Inline text={block.text} />
              </p>
            );
        }
      })}
    </>
  );
}

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      <Blocks blocks={blocks} />
    </div>
  );
}
