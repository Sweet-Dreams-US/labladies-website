import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPost } from "@/lib/blog";

// Post images live in content/blog/images/<slug>/ next to the markdown, and
// are served from here. An image is only served once its post is released.
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; file: string }> },
) {
  const { slug, file } = await params;
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  if (!/^[a-z0-9-]+$/.test(slug) || !/^[\w-]+(\.[\w-]+)*$/.test(file) || !TYPES[ext] || !getPost(slug)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(join(process.cwd(), "content", "blog", "images", slug, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[ext],
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
