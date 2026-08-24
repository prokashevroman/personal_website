import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import {
  CATEGORIES,
  getArchivePostBySlug,
  getArchiveSlugs,
  getCategoryBySlug,
} from "@/lib/last-click-city";

// One route serves both archive articles and the four category listings, so this
// card has to handle both shapes — same as the page itself.
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return [...getArchiveSlugs(), ...CATEGORIES.map((c) => c.slug)].map((slug) => ({ slug }));
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = getCategoryBySlug(slug);
  if (category) {
    return renderOgImage({
      eyebrow: "Last Click City · Category",
      headline: category.title,
      meta: `${category.articleSlugs.length} archived posts`,
    });
  }

  const post = getArchivePostBySlug(slug);
  if (!post) {
    return renderOgImage({ eyebrow: "Archive", headline: "Last Click City" });
  }

  const { frontmatter, readingMinutes } = post;
  const byline = frontmatter.author ? ` · ${frontmatter.author}` : "";
  return renderOgImage({
    eyebrow: "Last Click City · Archive",
    headline: frontmatter.title,
    meta: `${formatDate(frontmatter.date)} · ${readingMinutes} min read${byline}`,
  });
}
