import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveHero } from "@/components/archive/ArchiveHero";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { ArchiveArticleLayout } from "@/components/archive/ArchiveArticleLayout";
import { archiveCategoryTitle, ogLocale } from "@/lib/i18n";
import { RenderMdx } from "@/lib/mdx";
import {
  getArchivePostBySlug,
  getArchivePosts,
  getArchiveSlugs,
  getCategoryBySlug,
  CATEGORIES,
} from "@/lib/last-click-city";
import {
  JsonLd,
  absoluteUrl,
  archiveCollectionSchema,
  archivePostingSchema,
  breadcrumbSchema,
  esRobots,
  localizedAlternates,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type RouteParams = { slug: string };

// Articles and the four category listings share this one dynamic route, same as
// the English twin. Only translated articles are generated; the categories always
// are, since they come from shared data rather than from translated files.
export function generateStaticParams(): RouteParams[] {
  return [...getArchiveSlugs("es"), ...CATEGORIES.map((c) => c.slug)].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Category first, exactly as on the English side — the two slug sets are
  // disjoint, and keeping the branch order identical keeps the two in step.
  const category = getCategoryBySlug(slug);
  if (category) {
    const title = `${archiveCategoryTitle(category, "es")} — Last Click City`;
    const description = `${category.articleSlugs.length} artículos archivados sobre ${archiveCategoryTitle(category, "es")}, del blog Last Click City.`;
    return {
      title,
      description,
      alternates: localizedAlternates(`/last-click-city/${category.slug}`, "es"),
      robots: esRobots,
      openGraph: {
        type: "website",
        siteName: siteConfig.name,
        locale: ogLocale.es,
        title,
        description,
        url: absoluteUrl(`/es/last-click-city/${category.slug}`),
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const post = getArchivePostBySlug(slug, "es");
  // Unresolvable slug — the page itself 404s, but keep it out of the index in
  // case a stale URL is served before the 404 is seen.
  if (!post) return { robots: { index: false, follow: false } };
  const { frontmatter } = post;
  const url = absoluteUrl(`/es/last-click-city/${frontmatter.slug}`);
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    // Translating a post does not change who wrote it: 17 of the 40 archived
    // posts are a guest's, and the guard is the same here as in English.
    authors: [
      frontmatter.author
        ? {
            name: frontmatter.author,
            ...(frontmatter.authorUrl ? { url: frontmatter.authorUrl } : {}),
          }
        : { name: siteConfig.author.name, url: absoluteUrl("/es/about") },
    ],
    // Slug identity with the English twin is the URL-mirror invariant, enforced
    // at parse time by lib/last-click-city.ts.
    alternates: localizedAlternates(`/last-click-city/${frontmatter.slug}`, "es"),
    robots: esRobots,
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: ogLocale.es,
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.date,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
    },
  };
}

export default async function ArchiveSlugPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;

  // Category listing.
  const category = getCategoryBySlug(slug);
  if (category) {
    const bySlug = new Map(getArchivePosts("es").map((p) => [p.frontmatter.slug, p]));
    // Members with no translation yet drop out, so the listing never links to a
    // Spanish page that doesn't exist.
    const posts = category.articleSlugs
      .map((s) => bySlug.get(s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    const title = archiveCategoryTitle(category, "es");
    return (
      <div className="mx-auto max-w-3xl">
        <JsonLd
          schemas={[
            archiveCollectionSchema(category, posts, "es"),
            breadcrumbSchema([
              { name: "Inicio", path: "/es" },
              { name: "Last Click City", path: "/es/last-click-city" },
              { name: title, path: `/es/last-click-city/${category.slug}` },
            ]),
          ]}
        />
        <ArchiveHero eyebrow="Categoría" title={title} subtitle="Del archivo de Last Click City." />
        <div className="mt-14">
          {posts.map((post) => (
            <ArchiveCard key={post.frontmatter.slug} post={post} locale="es" />
          ))}
        </div>
        <div className="mt-16 border-t border-rule pt-8">
          <Link
            href="/es/last-click-city"
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            ← Todos los artículos
          </Link>
        </div>
      </div>
    );
  }

  // Article.
  const post = getArchivePostBySlug(slug, "es");
  if (!post) notFound();

  return (
    <>
      <JsonLd
        schemas={[
          archivePostingSchema(post, "es"),
          // Publisher `@id` on the posting points at the site owner's Person node,
          // so it has to be declared here too.
          personSchema(),
          breadcrumbSchema([
            { name: "Inicio", path: "/es" },
            { name: "Last Click City", path: "/es/last-click-city" },
            {
              name: post.frontmatter.title,
              path: `/es/last-click-city/${post.frontmatter.slug}`,
            },
          ]),
        ]}
      />
      <ArchiveArticleLayout post={post} locale="es">
        <RenderMdx source={post.content} />
      </ArchiveArticleLayout>
    </>
  );
}
