import Link from "next/link";
import type { ArchivePost } from "@/lib/last-click-city";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

type Props = {
  post: ArchivePost;
  children: React.ReactNode;
};

// Article shell for the archive — same shape as the site's ArticleLayout so the
// prose reads identically. No "AI helps polish" disclaimer and no comments; this
// is preserved historical writing.
export function ArchiveArticleLayout({ post, children }: Props) {
  const { frontmatter, readingMinutes } = post;
  const { title, date, author, authorUrl } = frontmatter;
  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-12">
        <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
          <time dateTime={date}>{formatDate(date)}</time>
          <span aria-hidden="true" className="text-ink-soft">·</span>
          <span>{readingMinutes} min read</span>
          {author ? (
            <>
              <span aria-hidden="true" className="text-ink-soft">·</span>
              <span>
                By{" "}
                {authorUrl ? (
                  <a
                    href={authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent"
                  >
                    {author}
                  </a>
                ) : (
                  author
                )}
              </span>
            </>
          ) : null}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tightish text-ink sm:text-5xl">
          {title}
        </h1>
      </header>
      <div className="prose prose-stone max-w-none">{children}</div>
      <div className="mt-12 border-t border-rule pt-6">
        <Link
          href="/last-click-city"
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          ← Back to Last Click City
        </Link>
      </div>
    </article>
  );
}
