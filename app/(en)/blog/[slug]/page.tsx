import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/ArticleLayout";
import { Comments } from "@/components/Comments";
import { RenderMdx } from "@/lib/mdx";
import { getPostBySlug, getPostLocales, getPublishedSlugs } from "@/lib/posts";
import {
  JsonLd,
  absoluteUrl,
  blogPostingSchema,
  breadcrumbSchema,
  indexable,
  localizedAlternates,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type RouteParams = { slug: string };

export function generateStaticParams(): RouteParams[] {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  // Unresolvable slug — the page itself 404s, but keep it out of the index in
  // case a stale URL is served before the 404 is seen.
  if (!post) return { robots: { index: false, follow: false } };
  const { frontmatter } = post;
  const url = absoluteUrl(`/blog/${frontmatter.slug}`);
  // The cluster lists exactly the locales this post is published in — an
  // untranslated locale must not have hreflang pointing at its 404. With only
  // English present, `localizedAlternates` emits a bare self-canonical.
  const locales = getPostLocales(frontmatter.slug);
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: [...frontmatter.tags],
    authors: [{ name: siteConfig.author.name, url: absoluteUrl("/about") }],
    alternates: localizedAlternates(`/blog/${frontmatter.slug}`, "en", locales),
    robots: indexable,
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updated ?? frontmatter.date,
      authors: [absoluteUrl("/about")],
      tags: [...frontmatter.tags],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        schemas={[
          blogPostingSchema(post),
          // The Person node is repeated on every page that references it —
          // BlogPosting's author/publisher `@id` would otherwise dangle, and a
          // cross-page `@id` is not guaranteed to be resolved.
          personSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.frontmatter.title, path: `/blog/${post.frontmatter.slug}` },
          ]),
        ]}
      />
      <ArticleLayout post={post}>
        <RenderMdx source={post.content} />
      </ArticleLayout>
      <div className="mx-auto mt-16 max-w-2xl">
        <Comments />
      </div>
    </>
  );
}
