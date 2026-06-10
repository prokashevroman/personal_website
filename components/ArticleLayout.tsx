import type { Post } from "@/lib/posts";

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
  post: Post;
  children: React.ReactNode;
};

export function ArticleLayout({ post, children }: Props) {
  const { frontmatter, readingMinutes } = post;
  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-12">
        <p className="eyebrow flex items-center gap-3">
          <time dateTime={frontmatter.date}>{formatDate(frontmatter.date)}</time>
          <span aria-hidden="true" className="text-ink-soft">·</span>
          <span>{readingMinutes} min read</span>
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tightish text-ink sm:text-5xl">
          {frontmatter.title}
        </h1>
      </header>
      <div className="prose prose-stone max-w-none">{children}</div>
      <p className="mt-12 border-t border-rule pt-6 text-sm italic leading-relaxed text-ink-muted">
        AI helps polish the writing. The thinking, observations, and opinions
        are my own — drawn from working inside marketing teams.
      </p>
    </article>
  );
}
