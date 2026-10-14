import { formatDate } from "@/lib/format-date";
import { archiveCategoryTitle, t } from "@/lib/i18n";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import {
  CATEGORIES,
  getArchivePostBySlug,
  getArchiveSlugs,
  getCategoryBySlug,
} from "@/lib/last-click-city";

// Spanish share cards for both shapes of the route. Own generateStaticParams —
// without it the es image route would not be generated for any slug.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return [...getArchiveSlugs("es"), ...CATEGORIES.map((c) => c.slug)].map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = getCategoryBySlug(slug);
  if (category) {
    return renderOgImage({
      eyebrow: "Last Click City · Categoría",
      headline: archiveCategoryTitle(category, "es"),
      meta: `${category.articleSlugs.length} artículos archivados`,
    });
  }

  const post = getArchivePostBySlug(slug, "es");
  if (!post) {
    return renderOgImage({ eyebrow: "Archivo", headline: "Last Click City" });
  }

  const { frontmatter, readingMinutes } = post;
  const byline = frontmatter.author ? ` · ${frontmatter.author}` : "";
  return renderOgImage({
    eyebrow: "Last Click City · Archivo",
    headline: frontmatter.title,
    meta: `${formatDate(frontmatter.date, "es", "long")} · ${readingMinutes} ${t.es.article.minRead}${byline}`,
  });
}
