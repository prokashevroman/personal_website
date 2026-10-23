import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { getAllPosts } from "@/lib/posts";

// Same reason as the English twin: /nl/blog declares its own `openGraph`,
// which suppresses the parent segment's image.
export const alt = "Essays over marketing, leiderschap en technologie";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  const count = getAllPosts("nl").filter((p) => p.frontmatter.published).length;
  return renderOgImage({
    eyebrow: "Geschreven werk",
    headline: "Essays over marketing, leiderschap en technologie.",
    meta: count > 0 ? `${count} ${count === 1 ? "essay" : "essays"}` : undefined,
  });
}
