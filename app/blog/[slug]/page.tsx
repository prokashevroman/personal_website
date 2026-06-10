import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/ArticleLayout";
import { Comments } from "@/components/Comments";
import { RenderMdx } from "@/lib/mdx";
import { getPostBySlug, getPublishedSlugs } from "@/lib/posts";
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
  if (!post) return {};
  const url = `${siteConfig.url}/blog/${post.frontmatter.slug}`;
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url,
      publishedTime: post.frontmatter.date,
      tags: post.frontmatter.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <ArticleLayout post={post}>
        <RenderMdx source={post.content} />
      </ArticleLayout>
      <div className="mx-auto mt-16 max-w-2xl">
        <Comments />
      </div>
    </>
  );
}
