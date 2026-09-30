import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { getAllPosts } from "@/lib/posts";

// Same reason as the English twin: /es/blog declares its own `openGraph`,
// which suppresses the parent segment's image.
export const alt = "Ensayos sobre marketing, liderazgo y tecnología";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  const count = getAllPosts("es").filter((p) => p.frontmatter.published).length;
  return renderOgImage({
    eyebrow: "Escritos",
    headline: "Ensayos sobre marketing, liderazgo y tecnología.",
    meta: count > 0 ? `${count} ${count === 1 ? "ensayo" : "ensayos"}` : undefined,
  });
}
