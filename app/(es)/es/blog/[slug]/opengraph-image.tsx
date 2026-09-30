import { formatDate } from "@/lib/format-date";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { getPostBySlug, getPublishedSlugs } from "@/lib/posts";

// Per-post Spanish share card. Own generateStaticParams — without it the es
// image route would not be generated for any slug.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getPublishedSlugs("es").map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug, "es");
  if (!post) {
    return renderOgImage({ eyebrow: "Ensayo", headline: "Roman Prokashev" });
  }
  const { frontmatter, readingMinutes } = post;
  return renderOgImage({
    eyebrow: "Ensayo",
    headline: frontmatter.title,
    meta: `${formatDate(frontmatter.date, "es", "long")} · ${readingMinutes} min de lectura`,
  });
}
