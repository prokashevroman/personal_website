"use client";

import Giscus from "@giscus/react";
import { t, type Locale } from "@/lib/i18n";

export function Comments({ locale = "en" }: { locale?: Locale }) {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
  const dict = t[locale].comments;

  if (!repo || !repoId || !category || !categoryId) {
    return (
      <section aria-labelledby="comments-heading" className="border-t border-slate-200/70 pt-10">
        <h2 id="comments-heading" className="text-lg font-semibold text-slate-900">
          {dict.heading}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{dict.unavailable}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="comments-heading" className="border-t border-slate-200/70 pt-10">
      <h2 id="comments-heading" className="text-lg font-semibold text-slate-900">
        {dict.heading}
      </h2>
      <div className="mt-4">
        <Giscus
          id="comments"
          repo={repo as `${string}/${string}`}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          // Keep `pathname` mapping: changing it would orphan the existing
          // English discussions. /es posts get their own threads — acceptable.
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme="light"
          lang={locale}
          loading="lazy"
        />
      </div>
    </section>
  );
}
