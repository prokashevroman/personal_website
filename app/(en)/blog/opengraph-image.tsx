import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { getAllPosts } from "@/lib/posts";

// A page that declares its own `openGraph` metadata does NOT inherit the root
// segment's opengraph-image, so /blog needs its own file or it ships with no
// share image at all.
export const alt = "Essays on marketing, leadership, and technology";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  const count = getAllPosts().filter((p) => p.frontmatter.published).length;
  return renderOgImage({
    eyebrow: "Writing",
    headline: "Essays on marketing, leadership, and technology.",
    meta: count > 0 ? `${count} ${count === 1 ? "essay" : "essays"}` : undefined,
  });
}
