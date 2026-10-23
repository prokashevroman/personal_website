import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { LOCALES, type Locale } from "@/lib/i18n";
import { postFrontmatterSchema, type PostFrontmatter } from "@/lib/validation";
import { readingTime } from "@/lib/reading-time";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type Post = {
  frontmatter: PostFrontmatter;
  content: string;
  filepath: string;
  readingMinutes: number;
};

function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

// English posts live flat in content/posts/; translations in content/posts/<locale>/.
// The English listing can't pick up translations because readdir is not
// recursive (`entry.isFile()` filters the `es` directory out).
function postsDir(locale: Locale): string {
  return locale === "en" ? POSTS_DIR : path.join(POSTS_DIR, locale);
}

function listMdxFiles(locale: Locale = "en"): string[] {
  const dir = postsDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => path.join(dir, entry.name));
}

function parseFile(filepath: string): Post {
  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);
  const parsed = postFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${path.relative(process.cwd(), filepath)}: ${parsed.error.message}`,
    );
  }
  return {
    frontmatter: parsed.data,
    content,
    filepath,
    readingMinutes: readingTime(content).minutes,
  };
}

export function getAllPosts(locale: Locale = "en"): Post[] {
  const posts = listMdxFiles(locale).map(parseFile);
  const filtered = isProd() ? posts.filter((p) => p.frontmatter.published) : posts;
  return filtered.sort((a, b) =>
    a.frontmatter.date < b.frontmatter.date ? 1 : a.frontmatter.date > b.frontmatter.date ? -1 : 0,
  );
}

export function getPublishedSlugs(locale: Locale = "en"): string[] {
  return listMdxFiles(locale)
    .map(parseFile)
    .filter((p) => p.frontmatter.published)
    .map((p) => p.frontmatter.slug);
}

export function getPostBySlug(slug: string, locale: Locale = "en"): Post | null {
  const found = listMdxFiles(locale)
    .map(parseFile)
    .find((p) => p.frontmatter.slug === slug);
  if (!found) return null;
  if (isProd() && !found.frontmatter.published) return null;
  return found;
}

/**
 * Which locales a post is published in. This is the per-file answer the
 * hreflang cluster needs: a post translated into Spanish but not Dutch must
 * advertise en+es and nothing more, or Dutch hreflang would point at a 404.
 * Draft-filtering applies per locale, so an unpublished translation drops out
 * in prod exactly as it drops out of the listings.
 */
export function getPostLocales(slug: string): Locale[] {
  return LOCALES.filter((locale) => getPostBySlug(slug, locale) !== null);
}
