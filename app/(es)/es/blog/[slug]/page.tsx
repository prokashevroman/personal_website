import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/ArticleLayout";
import { Comments } from "@/components/Comments";
import { ogLocale } from "@/lib/i18n";
import { RenderMdx } from "@/lib/mdx";
import { getPostBySlug, getPostLocales, getPublishedSlugs } from "@/lib/posts";
import {
  JsonLd,
  absoluteUrl,
  blogPostingSchema,
  breadcrumbSchema,
  localeRobots,
  localizedAlternates,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type RouteParams = { slug: string };

export function generateStaticParams(): RouteParams[] {
  return getPublishedSlugs("es").map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug, "es");
  // Unresolvable slug — the page itself 404s, but keep it out of the index in
  // case a stale URL is served before the 404 is seen.
  if (!post) return { robots: { index: false, follow: false } };
  const { frontmatter } = post;
  const url = absoluteUrl(`/es/blog/${frontmatter.slug}`);
  return {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: [...frontmatter.tags],
    authors: [{ name: siteConfig.author.name, url: absoluteUrl("/es/about") }],
    // Slug identity with the English twin is the URL-mirror invariant, so the
    // English path is just the slug path without the /es prefix. The cluster
    // lists every locale the post exists in, same as on the English side.
    alternates: localizedAlternates(
      `/blog/${frontmatter.slug}`,
      "es",
      getPostLocales(frontmatter.slug),
    ),
    robots: localeRobots("es"),
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      locale: ogLocale.es,
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      publishedTime: frontmatter.date,
      modifiedTime: frontmatter.updated ?? frontmatter.date,
      authors: [absoluteUrl("/es/about")],
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
  const post = getPostBySlug(slug, "es");
  if (!post) notFound();

  return (
    <>
      <JsonLd
        schemas={[
          blogPostingSchema(post, "es"),
          // The Person node is repeated on every page that references it —
          // BlogPosting's author/publisher `@id` would otherwise dangle, and a
          // cross-page `@id` is not guaranteed to be resolved.
          personSchema(),
          breadcrumbSchema([
            { name: "Inicio", path: "/es" },
            { name: "Blog", path: "/es/blog" },
            { name: post.frontmatter.title, path: `/es/blog/${post.frontmatter.slug}` },
          ]),
        ]}
      />
      <ArticleLayout post={post} locale="es">
        <RenderMdx source={post.content} />
      </ArticleLayout>
      <div className="mx-auto mt-16 max-w-2xl">
        <Comments locale="es" />
      </div>
    </>
  );
}
