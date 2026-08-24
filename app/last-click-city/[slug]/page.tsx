import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveHero } from "@/components/archive/ArchiveHero";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { ArchiveArticleLayout } from "@/components/archive/ArchiveArticleLayout";
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
  canonical,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type RouteParams = { slug: string };

// Articles and the four category listings share this one dynamic route.
export function generateStaticParams(): RouteParams[] {
  return [...getArchiveSlugs(), ...CATEGORIES.map((c) => c.slug)].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Self-canonical on both shapes: without it these pages inherited whatever the
  // parent declared, which used to be the homepage.
  const category = getCategoryBySlug(slug);
  if (category) {
    const title = `${category.title} — Last Click City`;
    const description = `${category.articleSlugs.length} archived posts on ${category.title} from the Last Click City blog.`;
    return {
      title,
      description,
      alternates: canonical(`/last-click-city/${category.slug}`),
      openGraph: {
        type: "website",
        siteName: siteConfig.name,
        locale: siteConfig.locale,
        title,
        description,
        url: absoluteUrl(`/last-click-city/${category.slug}`),
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const post = getArchivePostBySlug(slug);
  if (!post) return { robots: { index: false, follow: false } };
  const { frontmatter } = post;
  const url = absoluteUrl(`/last-click-city/${frontmatter.slug}`);
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    // Credit the original author rather than defaulting to the site owner —
    // 17 of the 40 archived posts were written by a guest.
    authors: [
      frontmatter.author
        ? { name: frontmatter.author, ...(frontmatter.authorUrl ? { url: frontmatter.authorUrl } : {}) }
        : { name: siteConfig.author.name, url: absoluteUrl("/about") },
    ],
    alternates: canonical(`/last-click-city/${frontmatter.slug}`),
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
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
    const bySlug = new Map(getArchivePosts().map((p) => [p.frontmatter.slug, p]));
    const posts = category.articleSlugs
      .map((s) => bySlug.get(s))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    return (
      <div className="mx-auto max-w-3xl">
        <JsonLd
          schemas={[
            archiveCollectionSchema(category, posts),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Last Click City", path: "/last-click-city" },
              { name: category.title, path: `/last-click-city/${category.slug}` },
            ]),
          ]}
        />
        <ArchiveHero eyebrow="Category" title={category.title} subtitle="From the Last Click City archive." />
        <div className="mt-14">
          {posts.map((post) => (
            <ArchiveCard key={post.frontmatter.slug} post={post} />
          ))}
        </div>
        <div className="mt-16 border-t border-rule pt-8">
          <Link
            href="/last-click-city"
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            ← All posts
          </Link>
        </div>
      </div>
    );
  }

  // Article.
  const post = getArchivePostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        schemas={[
          archivePostingSchema(post),
          // Publisher `@id` on the posting points at the site owner's Person node,
          // so it has to be declared here too.
          personSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Last Click City", path: "/last-click-city" },
            { name: post.frontmatter.title, path: `/last-click-city/${post.frontmatter.slug}` },
          ]),
        ]}
      />
      <ArchiveArticleLayout post={post}>
        <RenderMdx source={post.content} />
      </ArchiveArticleLayout>
    </>
  );
}
