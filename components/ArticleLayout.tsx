import { ClaudeMark } from "@/components/ClaudeMark";
import { formatDate } from "@/lib/format-date";
import { t, type Locale } from "@/lib/i18n";
import type { Post } from "@/lib/posts";

type Props = {
  post: Post;
  locale?: Locale;
  children: React.ReactNode;
};

export function ArticleLayout({ post, locale = "en", children }: Props) {
  const { frontmatter, readingMinutes } = post;
  const dict = t[locale].article;
  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-12">
        <p className="eyebrow flex items-center gap-3">
          <time dateTime={frontmatter.date}>{formatDate(frontmatter.date, locale, "long")}</time>
          <span aria-hidden="true" className="text-ink-soft">
            ·
          </span>
          <span>
            {readingMinutes} {dict.minRead}
          </span>
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.15] tracking-tightish text-ink sm:text-5xl">
          {frontmatter.title}
        </h1>
      </header>
      <div className="prose prose-stone max-w-none">{children}</div>
      <p className="mt-12 border-t border-rule pt-6 text-sm italic leading-relaxed text-ink-muted">
        {dict.aiDisclaimer}
      </p>
      {/* Translation disclosure — nothing renders in the locale the post was
          written in, which keeps English output untouched. */}
      {dict.translatedNote ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm italic leading-relaxed text-ink-muted">
          <ClaudeMark className="shrink-0" />
          {dict.translatedNote}
        </p>
      ) : null}
    </article>
  );
}
