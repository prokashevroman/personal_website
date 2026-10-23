import type { Metadata } from "next";
// Private-but-typed Next API — the same function Next uses to build its
// hashed metadata-image URLs. Needed because pages now live inside route
// groups, which makes Next serve opengraph-image under a hash-suffixed path
// (e.g. /blog/<slug>/opengraph-image-g58prh); a hand-built `/opengraph-image`
// URL in JSON-LD would 404. If a Next upgrade ever removes this export, the
// build fails loudly here — replace it with whatever Next then uses to
// resolve og:image URLs.
import { fillMetadataSegment } from "next/dist/lib/metadata/get-metadata-route";
// Type-only import on purpose: lib/last-click-city.ts reads 40 files from disk at
// module scope, and lib/seo.tsx is imported by every page. `import type` is
// erased at compile time, so the archive pipeline is never pulled into the
// homepage or /blog bundle.
import type { ArchivePost } from "@/lib/last-click-city";
import {
  LOCALE_INDEXABLE,
  archiveCategoryTitle,
  localePath,
  localesForPath,
  type Locale,
} from "@/lib/i18n";
import type { Post } from "@/lib/posts";
import { siteConfig } from "@/lib/site-config";

/*
 * Single place for canonical URLs, shared metadata fragments, and JSON-LD.
 *
 * Why canonicals live here and NOT in app/layout.tsx: Next merges metadata
 * shallowly per segment, so an `alternates.canonical` on the root layout is
 * inherited verbatim by every child page that doesn't set its own — which had
 * /blog, /about, and all 44 archive pages declaring the homepage as their
 * canonical. Every route now sets its own canonical explicitly via `canonical()`.
 */

/** Absolute, trailing-slash-free URL for a site-relative path. */
export function absoluteUrl(pathname: string): string {
  const url = new URL(pathname, siteConfig.url).toString();
  return url.length > 1 ? url.replace(/\/$/, "") : url;
}

/**
 * Absolute URL of a route-group page's opengraph-image, hash suffix included.
 * `segment` is the app-dir path WITH the group prefix — it must match the
 * folder the opengraph-image.tsx actually lives in, or the hash comes out
 * wrong. Only JSON-LD needs this; og:image/twitter:image meta tags are
 * resolved by Next itself.
 */
function ogImageUrl(segment: string, params: Record<string, string>): string {
  return absoluteUrl(fillMetadataSegment(segment, params, "opengraph-image"));
}

/**
 * The app-dir prefix each locale's pages live under, route group included.
 * `ogImageUrl` segments are built from these, so they must track the real
 * folder names — rename a route group and the JSON-LD image URLs 404 silently.
 */
const SEGMENT_ROOT: Record<Locale, string> = {
  en: "/(en)",
  es: "/(es)/es",
  nl: "/(nl)/nl",
};

/**
 * `robots` for a page that should be indexed. Applied per page rather than on the
 * root layout so it can't leak onto the 404 (which Next marks `noindex`
 * automatically and which cannot export metadata to override an inherited value).
 *
 * `index`/`follow` are omitted deliberately — indexable is already the default,
 * and asserting it only creates directives to contradict. The googleBot block is
 * the part that earns its keep: without it Google may show a truncated snippet
 * and a thumbnail-sized image rather than a full-width preview.
 */
export const indexable: NonNullable<Metadata["robots"]> = {
  googleBot: {
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

/**
 * `alternates` for a page: its own canonical plus the RSS link. The RSS entry is
 * repeated per page because a page-level `alternates` replaces the parent's
 * instead of merging into it.
 */
export function canonical(pathname: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: absoluteUrl(pathname),
    types: {
      "application/rss+xml": [{ url: siteConfig.rssPath, title: `${siteConfig.name} RSS` }],
    },
  };
}

/**
 * The `hreflang` cluster for an English path: every locale the page actually
 * exists in, plus `x-default` pointing at English. Returns `undefined` when
 * fewer than two locales qualify — a cluster of one says nothing, and emitting
 * it would only invite Search Console to complain about a self-referential set.
 *
 * `available` defaults to the locales the *route* exists in
 * (`localesForPath`, which knows the archive lags behind). Pages whose content
 * is translated per file — posts — pass the set they found on disk instead, so
 * a post translated into Spanish but not Dutch never points hreflang at a 404.
 *
 * Exported because app/sitemap.ts needs the identical set for its `xhtml:link`
 * alternates: the sitemap and the page must agree, so there is one builder.
 */
export function hreflangCluster(
  enPath: string,
  available: readonly Locale[] = localesForPath(enPath),
): Record<string, string> | undefined {
  const locales = available.filter((locale) => LOCALE_INDEXABLE[locale]);
  if (locales.length < 2) return undefined;
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(localePath(enPath, locale));
  }
  languages["x-default"] = absoluteUrl(enPath);
  return languages;
}

/**
 * `alternates` for a page that exists in more than one locale. `enPath` is
 * always the English path — every other variant is derived from it, which is
 * what keeps all sides of the cluster symmetrical. The canonical is
 * self-referential per locale; the `languages` cluster is identical on every
 * side (that is the requirement: each page in a set lists the whole set).
 *
 * With `available` omitted this covers structural pages — the homepage, /blog,
 * /about, the archive index and its category listings — which exist in a locale
 * whenever the route does. Post pages pass their own set; when that set is just
 * `["en"]` the output is exactly `canonical()`.
 */
export function localizedAlternates(
  enPath: string,
  locale: Locale = "en",
  available: readonly Locale[] = localesForPath(enPath),
): NonNullable<Metadata["alternates"]> {
  const languages = hreflangCluster(enPath, available);
  return {
    canonical: absoluteUrl(localePath(enPath, locale)),
    ...(languages ? { languages } : {}),
    types: {
      "application/rss+xml": [{ url: siteConfig.rssPath, title: `${siteConfig.name} RSS` }],
    },
  };
}

/**
 * `robots` for a page in a mirror locale. While that locale's `LOCALE_INDEXABLE`
 * flag is on this is the same as `indexable`; flipping the flag noindexes the
 * whole tree (follow stays on so link equity still flows) — together with the
 * hreflang/sitemap gating in `localizedAlternates` and app/sitemap.ts, that one
 * flag is the complete switch.
 */
export function localeRobots(locale: Locale): NonNullable<Metadata["robots"]> {
  return LOCALE_INDEXABLE[locale] ? indexable : { index: false, follow: true };
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

type Schema = Record<string, unknown>;

const PERSON_ID = `${siteConfig.url}/#person`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

export function personSchema(): Schema {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: siteConfig.author.name,
    url: siteConfig.url,
    jobTitle: siteConfig.author.jobTitle,
    description: siteConfig.description,
    image: absoluteUrl("/images/roman-prokashev.jpeg"),
    knowsAbout: [
      "Marketing strategy",
      "Marketing organizational design",
      "B2B demand generation",
      "Developer marketing",
      "Marketing measurement and analytics",
      "Growth strategy",
    ],
    // Omitted entirely when empty — an empty sameAs array is a weaker signal
    // than no sameAs at all.
    ...(siteConfig.author.sameAs.length > 0 ? { sameAs: [...siteConfig.author.sameAs] } : {}),
  };
}

export function webSiteSchema(): Schema {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": PERSON_ID },
  };
}

// Cross-surface translated strings ("Ensayos", "Essays") match the /es/blog and
// /nl/blog pages and their OG cards — keep them in sync when either changes.
const BLOG_NAME: Record<Locale, string> = {
  en: `${siteConfig.name} — Essays`,
  es: `${siteConfig.name} — Ensayos`,
  nl: `${siteConfig.name} — Essays`,
};

const BLOG_DESCRIPTION: Record<Locale, string> = {
  en: "Essays on marketing, leadership, and technology.",
  es: "Ensayos sobre marketing, liderazgo y tecnología.",
  nl: "Essays over marketing, leiderschap en technologie.",
};

const PROFILE_NAME: Record<Locale, string> = {
  en: `About ${siteConfig.author.name}`,
  es: `Sobre ${siteConfig.author.name}`,
  nl: `Over ${siteConfig.author.name}`,
};

function blogId(locale: Locale): string {
  return `${absoluteUrl(localePath("/blog", locale))}#blog`;
}

export function blogSchema(posts: Post[], locale: Locale = "en"): Schema {
  return {
    "@type": "Blog",
    "@id": blogId(locale),
    url: absoluteUrl(localePath("/blog", locale)),
    name: BLOG_NAME[locale],
    description: BLOG_DESCRIPTION[locale],
    inLanguage: locale,
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${absoluteUrl(localePath(`/blog/${post.frontmatter.slug}`, locale))}#article`,
      headline: post.frontmatter.title,
      url: absoluteUrl(localePath(`/blog/${post.frontmatter.slug}`, locale)),
      datePublished: post.frontmatter.date,
      author: { "@id": PERSON_ID },
    })),
  };
}

/**
 * `translator` on a Spanish posting — the machine-readable half of the visible
 * "Traducido del inglés con Claude" note. Deliberately NOT `author`: the
 * translation was produced with Claude, but the post is still its author's work,
 * and for the 17 guest-written archive posts saying otherwise would reassign a
 * real person's byline.
 */
const TRANSLATOR: Schema = {
  "@type": "Organization",
  name: "Anthropic",
  url: "https://claude.com",
};

export function blogPostingSchema(post: Post, locale: Locale = "en"): Schema {
  const enUrl = absoluteUrl(`/blog/${post.frontmatter.slug}`);
  const url = absoluteUrl(localePath(`/blog/${post.frontmatter.slug}`, locale));
  const { frontmatter, readingMinutes } = post;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: frontmatter.title,
    description: frontmatter.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: frontmatter.date,
    dateModified: frontmatter.updated ?? frontmatter.date,
    inLanguage: locale,
    keywords: [...frontmatter.tags],
    wordCount: post.content.trim().split(/\s+/).length,
    timeRequired: `PT${readingMinutes}M`,
    image: {
      "@type": "ImageObject",
      url: ogImageUrl(`${SEGMENT_ROOT[locale]}/blog/[slug]`, {
        slug: frontmatter.slug,
      }),
      width: 1200,
      height: 630,
    },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": blogId(locale) },
    // A translated post declares its English original, which ties the two
    // articles together for search engines without a shared @id.
    ...(locale !== "en"
      ? {
          translationOfWork: { "@type": "BlogPosting", "@id": `${enUrl}#article` },
          translator: TRANSLATOR,
        }
      : {}),
  };
}

export function profilePageSchema(locale: Locale = "en"): Schema {
  const url = absoluteUrl(localePath("/about", locale));
  return {
    "@type": "ProfilePage",
    "@id": `${url}#profilepage`,
    url,
    name: PROFILE_NAME[locale],
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
  };
}

// ---------------------------------------------------------------------------
// Last Click City archive
//
// Modelled as its own `Blog` rather than as part of the main one: it was a
// separate publication (lastclick.city, 2019–2023) that now lives here, and
// collapsing the two would misrepresent both.
// ---------------------------------------------------------------------------

const ARCHIVE_BLOG_DESCRIPTION: Record<Locale, string> = {
  en: "Archive of the Last Click City blog: digital analytics, Google Analytics, BigQuery, and attribution modelling, originally published at lastclick.city.",
  es: "Archivo del blog Last Click City: analítica digital, Google Analytics, BigQuery y modelos de atribución, publicado originalmente en lastclick.city.",
  // Unused while the archive is en+es only (see ARCHIVE_LOCALES); present so the
  // builder stays total and the day it's translated nothing silently falls back.
  nl: "Archief van de blog Last Click City: digitale analytics, Google Analytics, BigQuery en attributiemodellen, oorspronkelijk gepubliceerd op lastclick.city.",
};

function archiveBlogId(locale: Locale): string {
  return `${absoluteUrl(localePath("/last-click-city", locale))}#blog`;
}

export function archiveBlogSchema(locale: Locale = "en"): Schema {
  return {
    "@type": "Blog",
    "@id": archiveBlogId(locale),
    url: absoluteUrl(localePath("/last-click-city", locale)),
    // The publication's name, not a phrase — the same in both locales.
    name: "Last Click City",
    description: ARCHIVE_BLOG_DESCRIPTION[locale],
    inLanguage: locale,
    publisher: { "@id": PERSON_ID },
  };
}

/**
 * 17 of the 40 archive posts were written by a guest author. Attributing those to
 * the site owner would be factually wrong and would pollute his Person entity, so
 * a `author` in the frontmatter wins over the site-owner reference.
 */
function archiveAuthor(post: ArchivePost): Schema {
  const { author, authorUrl } = post.frontmatter;
  if (!author) return { "@id": PERSON_ID };
  return {
    "@type": "Person",
    name: author,
    ...(authorUrl ? { url: authorUrl, sameAs: [authorUrl] } : {}),
  };
}

export function archivePostingSchema(post: ArchivePost, locale: Locale = "en"): Schema {
  const enUrl = absoluteUrl(`/last-click-city/${post.frontmatter.slug}`);
  const url = absoluteUrl(localePath(`/last-click-city/${post.frontmatter.slug}`, locale));
  const { frontmatter, readingMinutes } = post;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: frontmatter.title,
    description: frontmatter.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    inLanguage: locale,
    wordCount: post.content.trim().split(/\s+/).length,
    timeRequired: `PT${readingMinutes}M`,
    image: {
      "@type": "ImageObject",
      url: ogImageUrl(`${SEGMENT_ROOT[locale]}/last-click-city/[slug]`, {
        slug: frontmatter.slug,
      }),
      width: 1200,
      height: 630,
    },
    author: archiveAuthor(post),
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": archiveBlogId(locale) },
    ...(locale !== "en"
      ? {
          translationOfWork: { "@type": "BlogPosting", "@id": `${enUrl}#article` },
          translator: TRANSLATOR,
        }
      : {}),
  };
}

/** Category listing pages within the archive. */
export function archiveCollectionSchema(
  category: { slug: string; title: string },
  posts: ArchivePost[],
  locale: Locale = "en",
): Schema {
  const url = absoluteUrl(localePath(`/last-click-city/${category.slug}`, locale));
  return {
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: `${archiveCategoryTitle(category, locale)} — Last Click City`,
    inLanguage: locale,
    isPartOf: { "@id": archiveBlogId(locale) },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: post.frontmatter.title,
        url: absoluteUrl(localePath(`/last-click-city/${post.frontmatter.slug}`, locale)),
      })),
    },
  };
}

/** `items` is ordered root-first; the last entry is the current page. */
export function breadcrumbSchema(items: { name: string; path: string }[]): Schema {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Renders one `@graph` document. Grouping every node into a single graph (rather
 * than emitting several sibling scripts) lets nodes cross-reference by `@id`,
 * so Person is declared once and reused.
 */
export function JsonLd({ schemas }: { schemas: Schema[] }) {
  const graph = { "@context": "https://schema.org", "@graph": schemas };
  return (
    <script
      type="application/ld+json"
      // JSON.stringify can emit `</script>` inside string values; escaping `<`
      // keeps it from breaking out of the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
