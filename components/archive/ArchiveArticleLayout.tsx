import Link from "next/link";
import { ClaudeMark } from "@/components/ClaudeMark";
import { formatDate } from "@/lib/format-date";
import { localePath, t, type Locale } from "@/lib/i18n";
import type { ArchivePost } from "@/lib/last-click-city";

type Props = {
  post: ArchivePost;
  locale?: Locale;
  children: React.ReactNode;
};

// Article shell for the archive — same shape as the site's ArticleLayout so the
// prose reads identically. No "AI helps polish" disclaimer and no comments; this
// is preserved historical writing. Translations do carry a disclosure note.
export function ArchiveArticleLayout({ post, locale = "en", children }: Props) {
  const { frontmatter, readingMinutes } = post;
  const { title, date, author, authorUrl } = frontmatter;
  const dict = t[locale];
  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-12">
        <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
          <time dateTime={date}>{formatDate(date, locale, "long")}</time>
          <span aria-hidden="true" className="text-ink-soft">·</span>
          <span>
            {readingMinutes} {dict.article.minRead}
          </span>
          {author ? (
            <>
              <span aria-hidden="true" className="text-ink-soft">·</span>
              <span>
                {dict.archive.by}{" "}
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
        {dict.article.translatedNote ? (
          <p className="mb-6 flex items-center gap-1.5 text-sm italic leading-relaxed text-ink-muted">
            <ClaudeMark className="shrink-0" />
            {dict.article.translatedNote}
          </p>
        ) : null}
        <Link
          href={localePath("/last-click-city", locale)}
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          {dict.archive.backToArchive}
        </Link>
      </div>
    </article>
  );
}
