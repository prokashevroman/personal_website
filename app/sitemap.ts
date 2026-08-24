import type { MetadataRoute } from "next";
import {
  CATEGORIES,
  getArchivePosts,
  type ArchivePost,
} from "@/lib/last-click-city";
import { getAllPosts, type Post } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";

/*
 * Only indexable URLs belong here — a noindexed URL in a sitemap surfaces as a
 * "Submitted URL marked noindex" error in Search Console.
 *
 * The Last Click City archive IS indexable, so its 45 URLs are included. This is
 * the one place the live and archive pipelines legitimately meet: they stay
 * separate lists so archive posts can never leak into the homepage, /blog, or the
 * feed (see the header comment in lib/last-click-city.ts).
 */

function postDate(post: Post): Date {
  const { updated, date } = post.frontmatter;
  return new Date(`${updated ?? date}T00:00:00Z`);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().filter((p) => p.frontmatter.published);

  // Derived from content, not from `new Date()`: a build-time timestamp makes
  // every page look freshly modified on every deploy, which trains crawlers to
  // ignore lastmod altogether.
  const latest = posts.length > 0 ? postDate(posts[0]!) : new Date(0);

  const staticRoutes: MetadataRoute.Sitemap = [
    // No trailing slash, so these match the canonical tags exactly.
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/blog"),
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: latest,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const postRoutes = posts.map<MetadataRoute.Sitemap[number]>((post) => ({
    url: absoluteUrl(`/blog/${post.frontmatter.slug}`),
    lastModified: postDate(post),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  // Archive: index, 40 articles, 4 category listings. `changeFrequency: never`
  // and a lower priority are honest signals — this content is preserved, not
  // maintained, so crawl budget belongs on the live essays first.
  const archivePosts = getArchivePosts();
  const archiveDate = (post: ArchivePost) => new Date(`${post.frontmatter.date}T00:00:00Z`);
  const newestArchive =
    archivePosts.length > 0 ? archiveDate(archivePosts[0]!) : new Date(0);
  const bySlug = new Map(archivePosts.map((p) => [p.frontmatter.slug, p]));

  const archiveRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/last-click-city"),
      lastModified: newestArchive,
      changeFrequency: "never",
      priority: 0.5,
    },
    ...archivePosts.map<MetadataRoute.Sitemap[number]>((post) => ({
      url: absoluteUrl(`/last-click-city/${post.frontmatter.slug}`),
      lastModified: archiveDate(post),
      changeFrequency: "never",
      priority: 0.4,
    })),
    ...CATEGORIES.map<MetadataRoute.Sitemap[number]>((category) => {
      const dates = category.articleSlugs
        .map((slug) => bySlug.get(slug))
        .filter((p): p is ArchivePost => Boolean(p))
        .map(archiveDate);
      return {
        url: absoluteUrl(`/last-click-city/${category.slug}`),
        lastModified:
          dates.length > 0
            ? new Date(Math.max(...dates.map((d) => d.getTime())))
            : newestArchive,
        changeFrequency: "never",
        priority: 0.3,
      };
    }),
  ];

  return [...staticRoutes, ...postRoutes, ...archiveRoutes];
}
