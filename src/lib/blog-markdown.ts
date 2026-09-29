/**
 * Reads the markdown post format in content/blog: a front matter block, then
 * a body of paragraphs, `##` headings, lists, quotes, images and `:::tip` /
 * `:::note` callouts. Pure functions, no file access, so it can be tested on
 * its own. Output is data; nothing here produces HTML.
 */

export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string; id: string }
  | { t: "h3"; text: string }
  | { t: "list"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "quote"; text: string }
  | { t: "callout"; kind: "tip" | "note"; title: string; blocks: Block[] }
  | { t: "image"; src: string; alt: string }
  | { t: "hr" };

export type Source = { title: string; author?: string; url?: string };

export type FrontMatter = {
  post_id?: string;
  seq?: number;
  title?: string;
  slug?: string;
  release_on?: string;
  description?: string;
  reading_minutes?: number;
  cover_image?: string;
  sources: Source[];
};

const unquote = (v: string) => {
  const s = v.trim();
  if (s.length >= 2 && ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'"))) {
    return s.slice(1, -1);
  }
  return s;
};

/** Splits `---` front matter from the body. Returns null when there is none. */
export function splitFrontMatter(raw: string): { head: string; body: string } | null {
  const text = raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)([\s\S]*)$/);
  return m ? { head: m[1], body: m[2] } : null;
}

/** The small YAML subset the format uses: scalars, plus `sources` as a list of maps. */
export function parseFrontMatter(head: string): FrontMatter {
  const fm: FrontMatter = { sources: [] };
  const lines = head.split("\n");
  let inSources = false;
  let current: Source | null = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    if (inSources && /^\s+/.test(line)) {
      const item = line.match(/^\s+-\s*(?:(\w+):\s*(.*))?$/);
      if (item) {
        current = { title: "" };
        fm.sources.push(current);
        if (item[1]) (current as Record<string, string>)[item[1]] = unquote(item[2] ?? "");
        continue;
      }
      const kv = line.match(/^\s+(\w+):\s*(.*)$/);
      if (kv && current) (current as Record<string, string>)[kv[1]] = unquote(kv[2]);
      continue;
    }

    inSources = false;
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    const value = unquote(rawValue);

    if (key === "sources") {
      inSources = true;
      continue;
    }
    if (key === "seq" || key === "reading_minutes") {
      const n = Number(value);
      if (Number.isFinite(n) && value !== "") fm[key] = n;
      continue;
    }
    if (
      key === "post_id" ||
      key === "title" ||
      key === "slug" ||
      key === "release_on" ||
      key === "description" ||
      key === "cover_image"
    ) {
      fm[key] = value;
    }
  }

  fm.sources = fm.sources.filter((s) => s.title);
  return fm;
}

export function slugifyHeading(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** Gives every h2 a unique anchor id, in order. Blocks without ids get them; existing ids are kept. */
export function withHeadingIds<T extends { t: string }>(blocks: T[]): Block[] {
  const seen = new Map<string, number>();
  return blocks.map((b) => {
    if (b.t !== "h2") return b as unknown as Block;
    const text = (b as unknown as { text: string }).text;
    const base = slugifyHeading(text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return { t: "h2", text, id: n === 0 ? base : `${base}-${n + 1}` } as Block;
  });
}

const CALLOUT_OPEN = /^:::(tip|note)(?:[ \t]+(.*))?$/;
const isBlockStart = (line: string) =>
  /^(#{1,6})\s+\S/.test(line) ||
  /^\s*[-*]\s+\S/.test(line) ||
  /^\s*\d+[.)]\s+\S/.test(line) ||
  /^>\s?/.test(line) ||
  /^!\[[^\]]*\]\([^)]+\)\s*$/.test(line) ||
  /^(-{3,}|\*{3,})\s*$/.test(line) ||
  CALLOUT_OPEN.test(line) ||
  line.trim() === ":::";

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const callout = line.trim().match(CALLOUT_OPEN);
    if (callout) {
      const inner: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        inner.push(lines[i]);
        i++;
      }
      i++; // closing :::
      const kind = callout[1] as "tip" | "note";
      blocks.push({
        t: "callout",
        kind,
        title: (callout[2] ?? "").trim() || (kind === "tip" ? "Tip" : "Note"),
        blocks: parseBlocks(inner),
      });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length;
      // `##` is a table-of-contents entry. Anything deeper is a sub-heading,
      // and a stray `#` in the body is treated the same way, because the
      // page already has its own h1.
      blocks.push(
        level === 2
          ? { t: "h2", text: heading[2], id: "" }
          : { t: "h3", text: heading[2] },
      );
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (image) {
      blocks.push({ t: "image", alt: image[1], src: image[2].trim() });
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ t: "quote", text: quote.join(" ").trim() });
      continue;
    }

    const ul = /^\s*[-*]\s+\S/;
    const ol = /^\s*\d+[.)]\s+\S/;
    if (ul.test(line) || ol.test(line)) {
      const ordered = ol.test(line);
      const marker = ordered ? ol : ul;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i])) {
        let text = lines[i].replace(ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-*]\s+/, "");
        i++;
        // Wrapped continuation lines belong to the item above.
        while (i < lines.length && lines[i].trim() && /^\s+\S/.test(lines[i]) && !marker.test(lines[i])) {
          text += ` ${lines[i].trim()}`;
          i++;
        }
        items.push(text.trim());
      }
      blocks.push({ t: ordered ? "ol" : "list", items });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && (para.length === 0 || !isBlockStart(lines[i]))) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ t: "p", text: para.join(" ") });
  }

  return blocks;
}

export function parseBody(body: string): Block[] {
  return withHeadingIds(parseBlocks(body.replace(/\r\n?/g, "\n").split("\n")));
}
