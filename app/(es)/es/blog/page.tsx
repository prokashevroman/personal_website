import type { Metadata } from "next";
import { BlogPostCard } from "@/components/BlogPostCard";
import { ogLocale } from "@/lib/i18n";
import { getAllPosts } from "@/lib/posts";
import {
  JsonLd,
  absoluteUrl,
  blogSchema,
  breadcrumbSchema,
  esRobots,
  localizedAlternates,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const TITLE = "Blog";
const SHARE_TITLE = "Ensayos sobre marketing, liderazgo y tecnología";
const DESCRIPTION = "Ensayos sobre marketing, liderazgo y tecnología.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: localizedAlternates("/blog", "es"),
  robots: esRobots,
  // Set explicitly and in full: a page-level `openGraph` replaces the Spanish
  // layout's instead of merging with it.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: ogLocale.es,
    title: SHARE_TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/es/blog"),
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: DESCRIPTION,
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts("es");
  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd
        schemas={[
          blogSchema(posts, "es"),
          personSchema(),
          breadcrumbSchema([
            { name: "Inicio", path: "/es" },
            { name: "Blog", path: "/es/blog" },
          ]),
        ]}
      />
      <p className="eyebrow">Escritos</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink">
        Ensayos
      </h1>
      <p className="mt-3 text-lg text-ink-muted">
        Sobre marketing, liderazgo y cómo funcionan las organizaciones en realidad.
      </p>
      <div className="mt-14 divide-y divide-rule">
        {posts.length === 0 ? (
          <p className="py-8 text-ink-muted">Todavía no hay ensayos publicados.</p>
        ) : (
          posts.map((post) => <BlogPostCard key={post.frontmatter.slug} post={post} locale="es" />)
        )}
      </div>
    </div>
  );
}
