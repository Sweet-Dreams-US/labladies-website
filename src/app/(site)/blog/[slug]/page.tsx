import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/Accordion";
import { PostBody } from "@/components/PostBody";
import { PostToc } from "@/components/PostToc";
import { CallButton, Heading, Section, TextButton } from "@/components/ui";
import { formatPostDate, getHeadings, getPost, getReleasedPosts } from "@/lib/blog";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// A post is checked against today's date in Fort Wayne every time this page
// is rendered, and pages are rendered again at least hourly. So a post goes
// live on its release date without a deploy, and before that it is a 404.
export const revalidate = 3600;

export function generateStaticParams() {
  return getReleasedPosts().map((p) => ({ slug: p.slug }));
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
      modifiedTime: post.date,
      section: post.category,
      authors: [site.name],
      // The image itself comes from the sibling opengraph-image.tsx.
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const more = getReleasedPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);
  const headings = getHeadings(post);

  const url = `${site.url}/blog/${post.slug}`;

  /**
   * Article, BreadcrumbList and, where the post has one, FAQPage.
   *
   * The FAQ block is what lets a direct question ("what is a mobile
   * phlebotomist") surface the answer itself rather than a bare link. The
   * breadcrumb gives the result a "Lab Ladies › Blog › …" trail instead of a
   * raw URL. The publisher points at the site-wide `#business` node rather
   * than restating the business, so the two can never drift apart.
   */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: "en-US",
      articleSection: post.category,
      // The stable site-wide card, not the per-post one: Next appends a
      // build-generated hash to generated image routes, so a hand-written URL
      // to the per-post image 404s, and a broken schema image is a Search
      // Console warning. The og:image tag still carries the per-post card.
      image: {
        "@type": "ImageObject",
        url: `${site.url}/opengraph-image.png`,
        width: 1200,
        height: 630,
      },
      author: { "@id": `${site.url}/#business` },
      publisher: { "@id": `${site.url}/#business` },
      isPartOf: { "@id": `${site.url}/#website` },
      mainEntityOfPage: url,
      ...(post.sources?.some((s) => s.url)
        ? {
            citation: post.sources
              .filter((s) => s.url)
              .map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
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
          {post.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover}
              alt=""
              className="mb-10 h-auto w-full rounded-3xl border border-cream-deep"
            />
          )}

          <article id="post-body">
            <PostBody blocks={post.body} />
          </article>

          {post.sources?.length ? (
            <div className="mt-14">
              <Heading as="h3">Sources</Heading>
              <ol className="mt-5 list-decimal space-y-3 pl-6 marker:font-bold marker:text-brand-ink">
                {post.sources.map((s) => (
                  <li key={s.title} className="pl-1">
                    {s.url && /^https?:\/\//i.test(s.url) ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-ink underline decoration-brand/40 underline-offset-4 hover:text-brand"
                      >
                        {s.title}
                      </a>
                    ) : (
                      <span className="font-semibold">{s.title}</span>
                    )}
                    {s.author ? <span className="text-muted">, {s.author}</span> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

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
                      {p.category && (
                        <p className="mb-2 text-xs font-bold tracking-[0.14em] text-brand-ink uppercase">
                          {p.category}
                        </p>
                      )}
                      <p className="font-bold text-balance">{p.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {headings.length >= 2 && <PostToc headings={headings} articleId="post-body" />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
