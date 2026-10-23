import type { Metadata } from "next";
import { BlogPostCard } from "@/components/BlogPostCard";
import { ogLocale } from "@/lib/i18n";
import { getAllPosts } from "@/lib/posts";
import {
  JsonLd,
  absoluteUrl,
  blogSchema,
  breadcrumbSchema,
  localeRobots,
  localizedAlternates,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const TITLE = "Blog";
const SHARE_TITLE = "Essays over marketing, leiderschap en technologie";
const DESCRIPTION = "Essays over marketing, leiderschap en technologie.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: localizedAlternates("/blog", "nl"),
  robots: localeRobots("nl"),
  // Set explicitly and in full: a page-level `openGraph` replaces the Dutch
  // layout's instead of merging with it.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: ogLocale.nl,
    title: SHARE_TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/nl/blog"),
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: DESCRIPTION,
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts("nl");
  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd
        schemas={[
          blogSchema(posts, "nl"),
          personSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/nl" },
            { name: "Blog", path: "/nl/blog" },
          ]),
        ]}
      />
      <p className="eyebrow">Geschreven werk</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink">
        Essays
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        Over marketing, leiderschap en hoe organisaties in werkelijkheid functioneren.
      </p>
      <div className="mt-14 divide-y divide-rule">
        {posts.length === 0 ? (
          <p className="py-8 text-ink-muted">Nog geen essays gepubliceerd.</p>
        ) : (
          posts.map((post) => <BlogPostCard key={post.frontmatter.slug} post={post} locale="nl" />)
        )}
      </div>
    </div>
  );
}
