import type { Metadata } from "next";
import { BlogPostCard } from "@/components/BlogPostCard";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Essays on marketing, leadership, and technology.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div className="mx-auto max-w-3xl">
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
