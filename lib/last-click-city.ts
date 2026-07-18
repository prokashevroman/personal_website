import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { readingTime } from "@/lib/reading-time";
import { CATEGORIES, PILLAR_ORDER, type ArchiveCategory } from "@/lib/last-click-city.data";

/*
 * Isolated read pipeline for the Last Click City archive. Deliberately parallel
 * to lib/posts.ts and NEVER wired into the live posts pipeline: it has no
 * `published` field and no prod/dev filter (the archive is always fully present),
 * and it must not be imported by the homepage, /blog, sitemap, or feed.
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

function listMdxFiles(): string[] {
  if (!fs.existsSync(ARCHIVE_DIR)) return [];
  return fs
    .readdirSync(ARCHIVE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => path.join(ARCHIVE_DIR, entry.name));
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

/** All archive posts, newest first. */
export function getArchivePosts(): ArchivePost[] {
  return listMdxFiles()
    .map(parseFile)
    .sort((a, b) =>
      a.frontmatter.date < b.frontmatter.date
        ? 1
        : a.frontmatter.date > b.frontmatter.date
          ? -1
          : 0,
    );
}

export function getArchiveSlugs(): string[] {
  return listMdxFiles().map(parseFile).map((p) => p.frontmatter.slug);
}

export function getArchivePostBySlug(slug: string): ArchivePost | null {
  return listMdxFiles()
    .map(parseFile)
    .find((p) => p.frontmatter.slug === slug) ?? null;
}

/** Posts in the original index (pillar) order; anything not listed is appended by date. */
export function getArchivePostsInPillarOrder(): ArchivePost[] {
  const bySlug = new Map(getArchivePosts().map((p) => [p.frontmatter.slug, p]));
  const ordered = PILLAR_ORDER.map((slug) => bySlug.get(slug)).filter(
    (p): p is ArchivePost => Boolean(p),
  );
  const seen = new Set(PILLAR_ORDER);
  const rest = getArchivePosts().filter((p) => !seen.has(p.frontmatter.slug));
  return [...ordered, ...rest];
}

export function getCategoryBySlug(slug: string): ArchiveCategory | null {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export { CATEGORIES, PILLAR_ORDER };
export type { ArchiveCategory };
