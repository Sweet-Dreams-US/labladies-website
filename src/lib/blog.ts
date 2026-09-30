import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseBody, parseFrontMatter, splitFrontMatter } from "./blog-markdown";
import type { Block, Source } from "./blog-markdown";

/**
 * The blog. Posts are markdown files in `content/blog`, nothing else: no post
 * text lives in code. Format and release rules are in BLOG-FORMAT.md.
 *
 * A post is visible on and after its `release_on` date in Fort Wayne time
 * (America/Indiana/Indianapolis). Before that it does not exist as far as the
 * pages, the sitemap and llms.txt are concerned. Pages revalidate at least
 * hourly and compare the date at render time, so a post goes live without a
 * deploy.
 *
 * The one exception is a preview deployment: a post with no `release_on` at
 * all is listed there, labelled, so it can be reviewed before go-live.
 * Production never shows one.
 *
 * House rules, same as everywhere else on this site: say what Lab Ladies
 * does, never what it doesn't; no children or pediatric copy; no claim about
 * a result or a diagnosis; no naming third-party laboratories as partners.
 */

export type { Block, Source };

export type Post = {
  slug: string;
  title: string;
  /** Meta description and the card blurb. Keep under about 160 characters. */
  description: string;
  /** ISO release date, or null when the post has none yet (preview only). */
  date: string | null;
  seq: number;
  readMinutes: number;
  body: Block[];
  sources?: Source[];
  /** A URL path served by the blog image route. */
  cover?: string;
};

const CONTENT_DIR = join(process.cwd(), "content", "blog");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Today's date in Fort Wayne, as YYYY-MM-DD. */
export function todayInFortWayne(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Indiana/Indianapolis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * True everywhere except production. When Vercel's own variable is missing the
 * build mode decides, so an unset variable can only ever hide posts.
 */
export const showsUnreleased = () =>
  process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV !== "production"
    : process.env.NODE_ENV !== "production";

function loadMarkdownPosts(): Post[] {
  let files: string[];
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const found = new Map<string, Post>();
  for (const file of files.sort()) {
    const parts = splitFrontMatter(readFileSync(join(CONTENT_DIR, file), "utf8"));
    const fm = parts ? parseFrontMatter(parts.head) : null;
    const slug = fm?.slug ?? "";
    if (!parts || !fm || !fm.title || !SLUG.test(slug) || !fm.description) {
      console.warn(`[blog] skipped ${file}: missing or invalid front matter`);
      continue;
    }
    // An empty release_on means "not released"; a malformed one is treated the same, never as "now".
    const date = fm.release_on && ISO_DATE.test(fm.release_on) ? fm.release_on : null;

    const words = parts.body.split(/\s+/).filter(Boolean).length;
    const cover = fm.cover_image?.replace(/^\.?\/?images\//, "");
    const post: Post = {
      slug,
      title: fm.title,
      description: fm.description,
      date,
      seq: fm.seq ?? 0,
      readMinutes: fm.reading_minutes ?? Math.max(1, Math.round(words / 200)),
      body: parseBody(parts.body),
      sources: fm.sources,
      cover: cover && /^[\w.-]+\/[\w.-]+$/.test(cover) ? `/blog/images/${cover}` : undefined,
    };

    // The same post can be in the folder twice while a dated copy replaces an
    // undated one. The dated copy wins, so a post never shows up twice.
    const key = fm.post_id || slug;
    const existing = found.get(key);
    if (!existing || (!existing.date && post.date)) found.set(key, post);
  }

  const seen = new Set<string>();
  return [...found.values()].filter((p) => !seen.has(p.slug) && seen.add(p.slug));
}

let cache: Post[] | null = null;

/** Every post that exists in the repo, released or not. Internal: never render from this. */
function allPosts(): Post[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = loadMarkdownPosts();
  return cache;
}

type ReleasedPost = Post & { date: string };

const isReleased = (p: Post, today: string): p is ReleasedPost => p.date !== null && p.date <= today;
const newestFirst = (a: ReleasedPost, b: ReleasedPost) => b.date.localeCompare(a.date);

/** Posts released as of now, newest first. The sitemap, llms.txt and the nav read this. */
export function getReleasedPosts(now = new Date()): ReleasedPost[] {
  const today = todayInFortWayne(now);
  return allPosts()
    .filter((p): p is ReleasedPost => isReleased(p, today))
    .sort(newestFirst);
}

/** What the blog pages list: released posts, plus undated ones on a preview deployment. */
export function getListedPosts(now = new Date()): Post[] {
  const undated = showsUnreleased() ? allPosts().filter((p) => p.date === null) : [];
  return [...getReleasedPosts(now), ...undated.sort((a, b) => a.seq - b.seq)];
}

/** A listed post by slug. Null before its release date on production, so the page 404s. */
export const getPost = (slug: string) => getListedPosts().find((p) => p.slug === slug) ?? null;

export const hasReleasedPosts = () => getReleasedPosts().length > 0;
export const hasListedPosts = () => getListedPosts().length > 0;

/** The h2 headings of a post, in order: the table of contents. */
export const getHeadings = (post: Post) =>
  post.body.flatMap((b) => (b.t === "h2" ? [{ id: b.id, text: b.text }] : []));

export const formatPostDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
