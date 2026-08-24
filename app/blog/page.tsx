import type { Metadata } from "next";
import { BlogPostCard } from "@/components/BlogPostCard";
import { getAllPosts } from "@/lib/posts";
import {
  JsonLd,
  absoluteUrl,
  blogSchema,
  breadcrumbSchema,
  canonical,
  indexable,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const TITLE = "Blog";
const SHARE_TITLE = "Essays on marketing, leadership, and technology";
const DESCRIPTION = "Essays on marketing, leadership, and technology.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: canonical("/blog"),
  robots: indexable,
  // Set explicitly: a page-level `openGraph` is not merged with the root
  // layout's, so without this the /blog share card showed homepage copy.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: SHARE_TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/blog"),
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: DESCRIPTION,
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd
        schemas={[
          blogSchema(posts),
          personSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />
      <p className="eyebrow">Writing</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink">
        Essays
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        On marketing, leadership, and the way organizations actually work.
      </p>
      <div className="mt-14 divide-y divide-rule">
        {posts.length === 0 ? (
          <p className="py-8 text-ink-muted">No posts published yet.</p>
        ) : (
          posts.map((post) => <BlogPostCard key={post.frontmatter.slug} post={post} />)
        )}
      </div>
    </div>
  );
}
