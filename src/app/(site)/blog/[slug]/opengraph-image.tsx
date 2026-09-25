import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPost, posts } from "@/lib/blog";
import { site } from "@/lib/site";

/**
 * A share image per blog post, carrying the post's own headline.
 *
 * Posts get shared as links — a daughter texting her sister "read this before
 * Mom's appointment". A preview showing the actual question the post answers
 * gets opened; a generic logo card gets scrolled past. Rendered once at build
 * for every post, so there's no runtime cost.
 */

export const alt = "Lab Ladies — mobile lab services in Palm Beach and Broward County";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  const [font, logo] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Inter-ExtraBold.ttf")),
    readFile(join(process.cwd(), "public/labladies-logo.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const title = post?.title ?? "Answers & Guides";
  // Long headlines step down a size rather than being cut off.
  const titleSize = title.length > 70 ? 54 : title.length > 50 ? 62 : 70;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fdf6ec",
          fontFamily: "Inter",
        }}
      >
        <div style={{ height: 14, background: "#de0f0d", display: "flex" }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 72px 52px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: 4,
              color: "#8e0906",
              textTransform: "uppercase",
            }}
          >
            {post?.category ?? "Lab Ladies"}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              lineHeight: 1.12,
              color: "#1a1512",
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <img src={logoSrc} width={132} height={110} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 38, color: "#1a1512" }}>
                {site.shortName}
              </div>
              <div style={{ display: "flex", fontSize: 26, color: "#de0f0d" }}>
                {site.phone} · Palm Beach & Broward
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Inter", data: font, weight: 800, style: "normal" }] },
  );
}
