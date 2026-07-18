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
  const category = getCategoryBySlug(slug);
  if (category) return { title: `${category.title} — Last Click City` };
  const post = getArchivePostBySlug(slug);
  if (!post) return {};
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
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
    <ArchiveArticleLayout post={post}>
      <RenderMdx source={post.content} />
    </ArchiveArticleLayout>
  );
}
