import Link from "next/link";
import { formatDate } from "@/lib/format-date";
import { localePath, t, type Locale } from "@/lib/i18n";
import type { Post } from "@/lib/posts";

type Props = {
  post: Post;
  locale?: Locale;
};

export function BlogPostCard({ post, locale = "en" }: Props) {
  const { frontmatter, readingMinutes } = post;
  const dict = t[locale].card;
  return (
    <article className="group border-b border-rule py-8 first:pt-0 last:border-b-0">
      <Link
        href={localePath(`/blog/${frontmatter.slug}`, locale)}
        className="block focus:outline-none"
      >
        <p className="eyebrow flex items-center gap-3">
          <time dateTime={frontmatter.date}>{formatDate(frontmatter.date, locale, "short")}</time>
          <span aria-hidden="true" className="text-ink-soft">
            ·
          </span>
          <span>
            {readingMinutes} {dict.minRead}
          </span>
          {!frontmatter.published ? (
            <>
              <span aria-hidden="true" className="text-ink-soft">
                ·
              </span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-wider text-amber-800">
                {dict.draft}
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
