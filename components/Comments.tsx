"use client";

import Giscus from "@giscus/react";

export function Comments() {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (!repo || !repoId || !category || !categoryId) {
    return (
      <section aria-labelledby="comments-heading" className="border-t border-slate-200/70 pt-10">
        <h2 id="comments-heading" className="text-lg font-semibold text-slate-900">
          Comments
        </h2>
        <p className="mt-2 text-sm text-slate-500">Comments will be available soon.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="comments-heading" className="border-t border-slate-200/70 pt-10">
      <h2 id="comments-heading" className="text-lg font-semibold text-slate-900">
        Comments
      </h2>
      <div className="mt-4">
        <Giscus
          id="comments"
          repo={repo as `${string}/${string}`}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme="light"
          lang="en"
          loading="lazy"
        />
      </div>
    </section>
  );
}
