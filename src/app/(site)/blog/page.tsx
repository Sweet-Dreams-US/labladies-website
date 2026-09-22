import type { Metadata } from "next";
import Link from "next/link";
import { CallButton, Eyebrow, Heading, Lead, Section, TextButton } from "@/components/ui";
import { formatPostDate, sortedPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mobile Lab & Phlebotomy Blog",
  description:
    "Plain answers about mobile blood draws, PCR testing and lab work at home in Palm Beach and Broward County, from the nurse-owned team at Lab Ladies.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <Heading as="h1">Answers &amp; Guides</Heading>
          <p className="mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
            The questions people ask us before they call — about home blood draws, PCR testing,
            difficult sticks and lab work in senior living communities. Written by the nurses who
            do the visits.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="ghost" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      <Section>
        <Eyebrow>Latest</Eyebrow>
        <Heading>From the Lab Ladies</Heading>
        <Lead className="mt-4">
          New posts every other week. If something here raises a question about your own situation,
          call us at {site.phone} — we would rather talk it through than have you guess.
        </Lead>

        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {sortedPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="flex h-full flex-col rounded-3xl border border-cream-deep bg-white p-7 shadow-sm transition-colors hover:border-brand/40"
              >
                <p className="text-sm font-bold tracking-[0.14em] text-brand-ink uppercase">
                  {post.category}
                </p>
                <h2 className="mt-3 text-xl font-extrabold tracking-tight text-balance sm:text-2xl">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 text-muted">{post.description}</p>
                <p className="mt-5 text-sm text-muted">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  {" · "}
                  {post.readMinutes} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
