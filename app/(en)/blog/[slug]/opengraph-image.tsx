import { formatDate } from "@/lib/format-date";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { getPostBySlug, getPublishedSlugs } from "@/lib/posts";

// Per-post share card. Generated at build time for every published slug, so
// LinkedIn/X show the article title instead of the generic site card.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return renderOgImage({ eyebrow: "Essay", headline: "Roman Prokashev" });
  }
  const { frontmatter, readingMinutes } = post;
  return renderOgImage({
    eyebrow: "Essay",
    headline: frontmatter.title,
    meta: `${formatDate(frontmatter.date, "en", "long")} · ${readingMinutes} min read`,
  });
}
