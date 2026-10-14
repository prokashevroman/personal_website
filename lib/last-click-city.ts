import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Locale } from "@/lib/i18n";
import { readingTime } from "@/lib/reading-time";
import { CATEGORIES, PILLAR_ORDER, type ArchiveCategory } from "@/lib/last-click-city.data";

/*
 * Isolated read pipeline for the Last Click City archive. Deliberately parallel
 * to lib/posts.ts and NEVER merged into the live posts pipeline: it has no
 * `published` field and no prod/dev filter (the archive is always fully present).
 *
 * Must not be imported by the homepage, /blog, or the feed — archive posts are a
 * separate publication and must never appear in a live post listing. `app/sitemap.ts`
 * is the one deliberate exception: the archive is indexed, so its URLs have to be
 * submitted, and the sitemap keeps them in their own list rather than concatenating
 * them into the live posts.
 */

// The archive keeps the original filenames as slugs to match the old og:urls, so
// unlike live posts a couple contain uppercase letters — allow mixed case here.
export const archivePostFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/, "slug must be kebab-case"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  description: z.string().min(1),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  originalUrl: z.string().min(1),
  thumbnail: z.string().optional(),
  excerptLead: z.string().optional(),
  excerpt: z.string().optional(),
});

export type ArchivePostFrontmatter = z.infer<typeof archivePostFrontmatterSchema>;

export type ArchivePost = {
  frontmatter: ArchivePostFrontmatter;
  content: string;
  readingMinutes: number;
};

const ARCHIVE_DIR = path.join(process.cwd(), "content", "last-click-city");

// English posts live flat in content/last-click-city/; translations in
// content/last-click-city/<locale>/. The English listing can't pick up
// translations because readdir is not recursive (`entry.isFile()` filters the
// `es` directory out).
function archiveDir(locale: Locale): string {
  return locale === "en" ? ARCHIVE_DIR : path.join(ARCHIVE_DIR, locale);
}

function listMdxFiles(locale: Locale = "en"): string[] {
  const dir = archiveDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => path.join(dir, entry.name));
}

function parseFile(filepath: string): ArchivePost {
  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);
  const parsed = archivePostFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid archive frontmatter in ${path.relative(process.cwd(), filepath)}: ${parsed.error.message}`,
    );
  }
  return { frontmatter: parsed.data, content, readingMinutes: readingTime(content).minutes };
}

/*
 * Frontmatter a translation must copy byte-for-byte from its English twin.
 * `slug` is the URL-mirror invariant (same path under /es); `date` keeps the two
 * sitemap entries and both `datePublished`s in agreement; `originalUrl` and
 * `thumbnail` point at the same artefacts; `author`/`authorUrl` because a
 * translation does not change who wrote the post — 17 of the 40 are a guest's
 * and must stay his in every locale.
 */
const TWIN_FIELDS = ["date", "originalUrl", "thumbnail", "author", "authorUrl"] as const;

/**
 * Throws the way `parseFile` does — an inconsistent translation fails
 * `pnpm build` rather than shipping a broken hreflang pair or a reassigned byline.
 */
function assertTwinInvariants(
  post: ArchivePost,
  english: ArchivePost | undefined,
  filepath: string,
): void {
  const where = path.relative(process.cwd(), filepath);
  if (!english) {
    throw new Error(
      `Archive translation ${where} has no English twin: no post in content/last-click-city/ has slug "${post.frontmatter.slug}".`,
    );
  }
  for (const field of TWIN_FIELDS) {
    const translated = post.frontmatter[field];
    const original = english.frontmatter[field];
    if (translated !== original) {
      throw new Error(
        `Archive translation ${where} must copy "${field}" from its English twin verbatim: got ${JSON.stringify(translated)}, expected ${JSON.stringify(original)}.`,
      );
    }
  }
}

function loadPosts(locale: Locale = "en"): ArchivePost[] {
  const files = listMdxFiles(locale);
  const posts = files.map(parseFile);
  if (locale === "en") return posts;
  const english = new Map(
    listMdxFiles("en")
      .map(parseFile)
      .map((p) => [p.frontmatter.slug, p] as const),
  );
  posts.forEach((post, i) =>
    assertTwinInvariants(post, english.get(post.frontmatter.slug), files[i]!),
  );
  return posts;
}

/** All archive posts, newest first. */
export function getArchivePosts(locale: Locale = "en"): ArchivePost[] {
  return loadPosts(locale).sort((a, b) =>
    a.frontmatter.date < b.frontmatter.date ? 1 : a.frontmatter.date > b.frontmatter.date ? -1 : 0,
  );
}

export function getArchiveSlugs(locale: Locale = "en"): string[] {
  return loadPosts(locale).map((p) => p.frontmatter.slug);
}

export function getArchivePostBySlug(slug: string, locale: Locale = "en"): ArchivePost | null {
  return loadPosts(locale).find((p) => p.frontmatter.slug === slug) ?? null;
}

/**
 * Posts in the original index (pillar) order; anything not listed is appended by
 * date. `PILLAR_ORDER` is slugs, so it serves both locales — and the filter drops
 * slugs with no file in `locale`, which is exactly what a partially translated
 * Spanish index should show.
 */
export function getArchivePostsInPillarOrder(locale: Locale = "en"): ArchivePost[] {
  const posts = getArchivePosts(locale);
  const bySlug = new Map(posts.map((p) => [p.frontmatter.slug, p]));
  const ordered = PILLAR_ORDER.map((slug) => bySlug.get(slug)).filter((p): p is ArchivePost =>
    Boolean(p),
  );
  const seen = new Set(PILLAR_ORDER);
  const rest = posts.filter((p) => !seen.has(p.frontmatter.slug));
  return [...ordered, ...rest];
}

export function getCategoryBySlug(slug: string): ArchiveCategory | null {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export { CATEGORIES, PILLAR_ORDER };
export type { ArchiveCategory };
