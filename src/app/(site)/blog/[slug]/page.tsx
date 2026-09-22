import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/Accordion";
import { CallButton, Heading, Section, TextButton } from "@/components/ui";
import { formatPostDate, getPost, posts, sortedPosts } from "@/lib/blog";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${site.url}/blog/${post.slug}`,
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = sortedPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  /**
   * Article plus, where the post has one, an FAQPage block. The FAQ schema is
   * what lets a direct question — "what is a mobile phlebotomist" — surface
   * the answer itself rather than just a link, which is the whole point of
   * writing these.
   */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      author: { "@type": "Organization", name: site.name },
      publisher: { "@type": "Organization", name: site.name },
      mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    },
    ...(post.faq?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: post.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-brand-deep to-brand px-5 py-12 text-white sm:px-8 md:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/blog"
            className="text-sm font-bold tracking-[0.14em] text-white/80 uppercase hover:text-white"
          >
            ← All posts
          </Link>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-white/85">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {" · "}
            {post.readMinutes} min read
          </p>
        </div>
      </section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <article className="space-y-6">
            {post.body.map((block, i) => {
              if (block.t === "h2") {
                return (
                  <h2
                    key={i}
                    className="pt-4 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.t === "list") {
                return (
                  <ul key={i} className="space-y-3 pl-1">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.t === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="border-l-4 border-brand bg-cream py-5 pl-6 text-lg font-semibold text-balance sm:text-xl"
                  >
                    {block.text}
                  </blockquote>
                );
              }
              return (
                <p key={i} className="text-lg leading-relaxed">
                  {block.text}
                </p>
              );
            })}
          </article>

          {post.faq?.length ? (
            <div className="mt-14">
              <Heading as="h3">Common questions</Heading>
              <div className="mt-6 space-y-3">
                {post.faq.map((f) => (
                  <Accordion key={f.q} title={f.q}>
                    <p>{f.a}</p>
                  </Accordion>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-14 rounded-3xl bg-cream p-8 text-center">
            <Heading as="h3">Questions about your own situation?</Heading>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Call or text and we will tell you plainly whether this is something we can help with.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <CallButton />
              <TextButton />
            </div>
          </div>

          {more.length > 0 && (
            <div className="mt-14">
              <Heading as="h3">Keep reading</Heading>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {more.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="block h-full rounded-2xl border border-cream-deep bg-white p-6 transition-colors hover:border-brand/40"
                    >
                      <p className="text-xs font-bold tracking-[0.14em] text-brand-ink uppercase">
                        {p.category}
                      </p>
                      <p className="mt-2 font-bold text-balance">{p.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
