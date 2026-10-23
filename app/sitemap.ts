import type { MetadataRoute } from "next";
import {
  ARCHIVE_LOCALES,
  LOCALE_INDEXABLE,
  MIRROR_LOCALES,
  localePath,
  type Locale,
} from "@/lib/i18n";
import { CATEGORIES, getArchivePosts, type ArchivePost } from "@/lib/last-click-city";
import { getAllPosts, type Post } from "@/lib/posts";
import { absoluteUrl, hreflangCluster } from "@/lib/seo";

/*
 * Only indexable URLs belong here — a noindexed URL in a sitemap surfaces as a
 * "Submitted URL marked noindex" error in Search Console.
 *
 * The Last Click City archive IS indexable, so its 45 English URLs are included,
 * plus its Spanish mirror (index + 4 categories + however many articles are
 * translated). This is the one place the live and archive pipelines legitimately
 * meet: they stay separate lists so archive posts can never leak into the
 * homepage, /blog, or the feed (see the header comment in lib/last-click-city.ts).
 */

function postDate(post: Post): Date {
  const { updated, date } = post.frontmatter;
  return new Date(`${updated ?? date}T00:00:00Z`);
}

/**
 * xhtml:link hreflang alternates, keyed by the English path. Emitted on every
 * entry in the cluster, because each sitemap entry has to list the whole set.
 * Built by the same `hreflangCluster` the page metadata uses, so the sitemap
 * and the pages can't disagree — and a noindexed locale is excluded there, which
 * keeps it out of here too, not even as an alternate.
 */
function clusterAlternates(
  enPath: string,
  available?: readonly Locale[],
): MetadataRoute.Sitemap[number]["alternates"] {
  const languages = hreflangCluster(enPath, available);
  return languages ? { languages } : undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().filter((p) => p.frontmatter.published);

  // Derived from content, not from `new Date()`: a build-time timestamp makes
  // every page look freshly modified on every deploy, which trains crawlers to
  // ignore lastmod altogether.
  const latest = posts.length > 0 ? postDate(posts[0]!) : new Date(0);

  // A translation only counts when its English original is published — a mirror
  // never introduces URLs of its own.
  const englishSlugs = new Set(posts.map((p) => p.frontmatter.slug));
  const indexableMirrors = MIRROR_LOCALES.filter((locale) => LOCALE_INDEXABLE[locale]);
  const mirrorPosts = new Map<Locale, Post[]>(
    indexableMirrors.map((locale) => [
      locale,
      getAllPosts(locale).filter(
        (p) => p.frontmatter.published && englishSlugs.has(p.frontmatter.slug),
      ),
    ]),
  );

  // slug → every locale publishing it, so both sides of a cluster list the same
  // set. A post nobody has translated keeps a single-locale set, which
  // `hreflangCluster` turns into no alternates at all.
  const postLocales = new Map<string, Locale[]>(
    posts.map((p) => [p.frontmatter.slug, ["en"] as Locale[]]),
  );
  for (const [locale, localePosts] of mirrorPosts) {
    for (const post of localePosts) postLocales.get(post.frontmatter.slug)?.push(locale);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    // No trailing slash, so these match the canonical tags exactly.
    {
      url: absoluteUrl("/"),
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 1,
      alternates: clusterAlternates("/"),
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: clusterAlternates("/blog"),
    },
    {
      url: absoluteUrl("/about"),
      lastModified: latest,
      changeFrequency: "yearly",
      priority: 0.5,
      alternates: clusterAlternates("/about"),
    },
  ];

  const postRoutes = posts.map<MetadataRoute.Sitemap[number]>((post) => ({
    url: absoluteUrl(`/blog/${post.frontmatter.slug}`),
    lastModified: postDate(post),
    changeFrequency: "yearly",
    priority: 0.7,
    // Untranslated posts stay hreflang-free — same guard as the page metadata.
    alternates: clusterAlternates(
      `/blog/${post.frontmatter.slug}`,
      postLocales.get(post.frontmatter.slug),
    ),
  }));

  // Every mirror locale, one notch below the English ladder: same content,
  // secondary language, so crawl budget belongs on the English tree first.
  const mirrorRoutes: MetadataRoute.Sitemap = indexableMirrors.flatMap((locale) => [
    {
      url: absoluteUrl(localePath("/", locale)),
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: clusterAlternates("/"),
    },
    {
      url: absoluteUrl(localePath("/blog", locale)),
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: clusterAlternates("/blog"),
    },
    {
      url: absoluteUrl(localePath("/about", locale)),
      lastModified: latest,
      changeFrequency: "yearly" as const,
      priority: 0.4,
      alternates: clusterAlternates("/about"),
    },
    ...(mirrorPosts.get(locale) ?? []).map<MetadataRoute.Sitemap[number]>((post) => ({
      url: absoluteUrl(localePath(`/blog/${post.frontmatter.slug}`, locale)),
      lastModified: postDate(post),
      changeFrequency: "yearly",
      priority: 0.6,
      alternates: clusterAlternates(
        `/blog/${post.frontmatter.slug}`,
        postLocales.get(post.frontmatter.slug),
      ),
    })),
  ]);

  // Archive: index, 40 articles, 4 category listings. `changeFrequency: never`
  // and a lower priority are honest signals — this content is preserved, not
  // maintained, so crawl budget belongs on the live essays first.
  const archivePosts = getArchivePosts();
  const archiveDate = (post: ArchivePost) => new Date(`${post.frontmatter.date}T00:00:00Z`);
  const newestArchive = archivePosts.length > 0 ? archiveDate(archivePosts[0]!) : new Date(0);
  const bySlug = new Map(archivePosts.map((p) => [p.frontmatter.slug, p]));

  // The archive's mirror locales are tracked separately from the live site's
  // (ARCHIVE_LOCALES) because the archive is translated post by post and lags
  // behind: /nl has no archive at all today.
  const archiveMirrors = ARCHIVE_LOCALES.filter(
    (locale) => locale !== "en" && LOCALE_INDEXABLE[locale],
  );

  // slug → every locale publishing it, same role as `postLocales` above.
  const archivePostLocales = new Map<string, Locale[]>(
    archivePosts.map((p) => [p.frontmatter.slug, ["en"] as Locale[]]),
  );
  const mirrorArchivePosts = new Map<Locale, ArchivePost[]>(
    archiveMirrors.map((locale) => {
      const localePosts = getArchivePosts(locale);
      for (const post of localePosts) archivePostLocales.get(post.frontmatter.slug)?.push(locale);
      return [locale, localePosts];
    }),
  );

  const categoryDate = (
    category: (typeof CATEGORIES)[number],
    source: Map<string, ArchivePost>,
    fallback: Date,
  ): Date => {
    const dates = category.articleSlugs
      .map((slug) => source.get(slug))
      .filter((p): p is ArchivePost => Boolean(p))
      .map(archiveDate);
    return dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : fallback;
  };

  const archiveRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/last-click-city"),
      lastModified: newestArchive,
      changeFrequency: "never",
      priority: 0.5,
      alternates: clusterAlternates("/last-click-city"),
    },
    ...archivePosts.map<MetadataRoute.Sitemap[number]>((post) => ({
      url: absoluteUrl(`/last-click-city/${post.frontmatter.slug}`),
      lastModified: archiveDate(post),
      changeFrequency: "never",
      priority: 0.4,
      // Untranslated posts stay hreflang-free — same guard as the page metadata.
      alternates: clusterAlternates(
        `/last-click-city/${post.frontmatter.slug}`,
        archivePostLocales.get(post.frontmatter.slug),
      ),
    })),
    ...CATEGORIES.map<MetadataRoute.Sitemap[number]>((category) => ({
      url: absoluteUrl(`/last-click-city/${category.slug}`),
      lastModified: categoryDate(category, bySlug, newestArchive),
      changeFrequency: "never",
      priority: 0.3,
      alternates: clusterAlternates(`/last-click-city/${category.slug}`),
    })),
  ];

  // Each mirror of the archive, one notch below the English ladder for the same
  // reason /es sits below / — same content, secondary language.
  const mirrorArchiveRoutes: MetadataRoute.Sitemap = archiveMirrors.flatMap((locale) => {
    const localePosts = mirrorArchivePosts.get(locale) ?? [];
    const localeBySlug = new Map(localePosts.map((p) => [p.frontmatter.slug, p]));
    // A category's mirror lastmod must not claim a date from an article only the
    // English side has, so it falls back to the newest *translated* post.
    const newestLocale = localePosts.length > 0 ? archiveDate(localePosts[0]!) : newestArchive;
    return [
      {
        url: absoluteUrl(localePath("/last-click-city", locale)),
        lastModified: newestLocale,
        changeFrequency: "never" as const,
        priority: 0.4,
        alternates: clusterAlternates("/last-click-city"),
      },
      ...localePosts.map<MetadataRoute.Sitemap[number]>((post) => ({
        url: absoluteUrl(localePath(`/last-click-city/${post.frontmatter.slug}`, locale)),
        lastModified: archiveDate(post),
        changeFrequency: "never",
        priority: 0.3,
        alternates: clusterAlternates(
          `/last-click-city/${post.frontmatter.slug}`,
          archivePostLocales.get(post.frontmatter.slug),
        ),
      })),
      ...CATEGORIES.map<MetadataRoute.Sitemap[number]>((category) => ({
        url: absoluteUrl(localePath(`/last-click-city/${category.slug}`, locale)),
        lastModified: categoryDate(category, localeBySlug, newestLocale),
        changeFrequency: "never",
        priority: 0.2,
        alternates: clusterAlternates(`/last-click-city/${category.slug}`),
      })),
    ];
  });

  return [
    ...staticRoutes,
    ...postRoutes,
    ...mirrorRoutes,
    ...archiveRoutes,
    ...mirrorArchiveRoutes,
  ];
}
