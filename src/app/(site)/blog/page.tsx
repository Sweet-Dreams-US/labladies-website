import type { Metadata } from "next";
import Link from "next/link";
import { CallButton, Eyebrow, Heading, Lead, Section, TextButton } from "@/components/ui";
import { formatPostDate, getListedPosts } from "@/lib/blog";
import { site } from "@/lib/site";

// Posts release by date, so the list is rebuilt at least hourly.
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Lab Testing & Collection Blog",
    description:
      "Plain answers about lab tests, sample collection and what happens next, from Lab Ladies, a nurse-owned mobile laboratory service.",
    alternates: { canonical: "/blog" },
    // The old post addresses redirect here, so the page must exist; with
    // nothing on it, it stays out of search results.
    ...(getListedPosts().length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function BlogIndex() {
  const posts = getListedPosts();

  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-14 text-white sm:px-8 md:py-20">
        <div className="mx-auto w-full max-w-6xl">
          <Heading as="h1">Answers &amp; Guides</Heading>
          <p className="mt-5 max-w-3xl text-lg text-white/90 sm:text-xl">
            Plain answers to the questions people have about lab tests and how a sample is
            collected, for patients and the family members who help them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CallButton variant="ghost" />
            <TextButton variant="ghost" />
          </div>
        </div>
      </section>

      <Section>
        {posts.length === 0 ? (
          <>
            <Eyebrow>Blog</Eyebrow>
            <Heading>Nothing posted yet</Heading>
            <Lead className="mt-4">
              Have a question about a home blood draw or a lab test? Call or text {site.phone}.
              We would rather talk it through than have you guess.
            </Lead>
          </>
        ) : (
          <>
            <Eyebrow>Latest</Eyebrow>
            <Heading>From the Lab Ladies</Heading>
            <Lead className="mt-4">
              If something here raises a question about your own situation, call us at{" "}
              {site.phone}. We would rather talk it through than have you guess.
            </Lead>

            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex h-full flex-col rounded-3xl border border-cream-deep bg-white p-7 shadow-sm transition-colors hover:border-brand/40"
                  >
                    {!post.date && (
                      <p className="mb-3 w-fit rounded-full bg-cream px-3 py-1 text-sm font-bold text-brand-ink ring-1 ring-brand/25 ring-inset">
                        Preview, not released
                      </p>
                    )}
                    <h2 className="text-xl font-extrabold tracking-tight text-balance sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="mt-3 flex-1 text-muted">{post.description}</p>
                    <p className="mt-5 text-sm text-muted">
                      {post.date && (
                        <>
                          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                          {" · "}
                        </>
                      )}
                      {post.readMinutes} min read
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </>
  );
}
