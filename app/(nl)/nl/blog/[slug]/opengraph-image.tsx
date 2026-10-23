import { formatDate } from "@/lib/format-date";
import { t } from "@/lib/i18n";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { getPostBySlug, getPublishedSlugs } from "@/lib/posts";

// Per-post Dutch share card. Own generateStaticParams — without it the nl
// image route would not be generated for any slug.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getPublishedSlugs("nl").map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug, "nl");
  if (!post) {
    return renderOgImage({ eyebrow: "Essay", headline: "Roman Prokashev" });
  }
  const { frontmatter, readingMinutes } = post;
  return renderOgImage({
    eyebrow: "Essay",
    headline: frontmatter.title,
    meta: `${formatDate(frontmatter.date, "nl", "long")} · ${readingMinutes} ${t.nl.article.minRead}`,
  });
}
