import Link from "next/link";
import type { Post } from "@/lib/posts";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

type Props = {
  post: Post;
};

export function BlogPostCard({ post }: Props) {
  const { frontmatter, readingMinutes } = post;
  return (
    <article className="group border-b border-rule py-8 first:pt-0 last:border-b-0">
      <Link href={`/blog/${frontmatter.slug}`} className="block focus:outline-none">
        <p className="eyebrow flex items-center gap-3">
          <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
          <span aria-hidden="true" className="text-ink-soft">·</span>
          <span>{readingMinutes} min read</span>
          {!frontmatter.published ? (
            <>
              <span aria-hidden="true" className="text-ink-soft">·</span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wider text-amber-800">
                Draft
              </span>
            </>
          ) : null}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tightish text-ink transition-colors group-hover:text-accent">
          {frontmatter.title}
        </h2>
      </Link>
    </article>
  );
}
