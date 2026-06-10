import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
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

function listMdxFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => path.join(POSTS_DIR, entry.name));
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

export function getAllPosts(): Post[] {
  const posts = listMdxFiles().map(parseFile);
  const filtered = isProd() ? posts.filter((p) => p.frontmatter.published) : posts;
  return filtered.sort((a, b) =>
    a.frontmatter.date < b.frontmatter.date ? 1 : a.frontmatter.date > b.frontmatter.date ? -1 : 0,
  );
}

export function getPublishedSlugs(): string[] {
  return listMdxFiles()
    .map(parseFile)
    .filter((p) => p.frontmatter.published)
    .map((p) => p.frontmatter.slug);
}

export function getPostBySlug(slug: string): Post | null {
  const found = listMdxFiles()
    .map(parseFile)
    .find((p) => p.frontmatter.slug === slug);
  if (!found) return null;
  if (isProd() && !found.frontmatter.published) return null;
  return found;
}
