# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (locked at 11.5.2; Node >=20).

```bash
pnpm dev                  # next dev on :3000
pnpm build                # production build
pnpm start                # serve the production build
pnpm lint                 # next lint (extends next/core-web-vitals)
pnpm typecheck            # tsc --noEmit
pnpm new:post "Title"     # scaffold content/posts/<slug>.mdx + image folder
```

There is no test runner configured. `pnpm typecheck` and `pnpm build` are the verification gates.

Path alias `@/*` resolves to the repo root (see `tsconfig.json`).

## Architecture

### Posts pipeline (`lib/posts.ts` + `lib/validation.ts`)

Posts are MDX files in `content/posts/` (English) and `content/posts/es/` (Spanish translations). The pipeline is:

1. `listMdxFiles(locale)` reads `content/posts/*.mdx` (or `content/posts/es/*.mdx`) synchronously from disk. The English listing can't pick up translations because readdir is not recursive.
2. `parseFile()` runs gray-matter, then validates frontmatter against `postFrontmatterSchema` (zod). **Invalid frontmatter throws** — this fails the build, which is intentional.
3. The slug comes from the **frontmatter field, not the filename**. The two happen to match because `scripts/new-post.ts` creates them that way, but `getPostBySlug` looks up by frontmatter slug.
4. **Critical prod/dev divergence**: when `NODE_ENV === "production"`, `getAllPosts`, `getPublishedSlugs`, and `getPostBySlug` filter out `published: false`. In dev, drafts are visible. This single switch drives draft-hiding across the homepage, `/blog`, `/sitemap.xml`, `/feed.xml`, and `generateStaticParams` in `app/(en)/blog/[slug]/page.tsx`. Anything new that lists posts should call these functions — do not re-implement the filter.
5. All three exported functions take `locale: Locale = "en"` — default calls stay English-only, which is what keeps the feed, llms.txt Essays section, and English listings free of Spanish leakage.

### MDX rendering (`lib/mdx.tsx` + `components/mdx-components.tsx`)

Rendering uses `next-mdx-remote-client/rsc` (runtime MDX → React Server Components), **not** Next's built-in `@next/mdx` page support. `next.config.mjs` deliberately sets `pageExtensions: ["ts", "tsx"]` — `.mdx` files are content, never routes.

`mdx-components.tsx` overrides `<img>` with `MdxImage`, which reads PNG/JPEG headers at build time to extract intrinsic dimensions for `next/image`. Anything else (SVG, WebP, AVIF) falls back to a 1200×675 placeholder. Add new MDX element overrides here, not in `lib/mdx.tsx`.

To use a new remark/rehype plugin, add it to the `mdxOptions` in `RenderMdx`.

### API routes (`app/api/*/route.ts`)

Both `subscribe` and `contact` follow the same defensive pattern:

- Honeypot field (`website`) is checked **before** zod validation, and a hit returns `200 ok:true` silently so bots can't tell the field exists.
- Missing env vars return `503` ("temporarily unavailable") rather than `500`, and log to `console.error`.
- For `subscribe`, Buttondown's "already exists" 400 is mapped to `200 ok:true` to avoid leaking list membership.

Honeypot logic and zod schemas live in `lib/validation.ts` — reuse `hasHoneypot()` and the `*InputSchema` exports rather than re-validating ad-hoc.

### Localization: the `/es` mirror (`lib/i18n.ts` + route groups)

Every page has a Spanish twin at `/es/<same-path>` — the live site and the Last Click City archive alike. The language switcher is a plain `localePath()` both ways, with no special cases.

- **Two root layouts, no `app/layout.tsx`.** `app/(en)/layout.tsx` and `app/(es)/layout.tsx` each own their `<html>` (that's what lets `/es` declare `lang="es"`); the shared body lives in `components/RootShell.tsx` (fonts + `globals.css` + Header/Footer) so the two can't drift. **Never re-create a root `app/layout.tsx` or `app/not-found.tsx`** — with no root layout, Next 15.5 renders a root 404 inside a built-in bare `<html>` with no CSS. Instead, per-group catch-alls (`app/(en)/[...rest]/page.tsx`, `app/(es)/es/[...rest]/page.tsx`) call `notFound()` and per-group `not-found.tsx` render localized 404s. The catch-alls are dynamic (ƒ) — fine on the server deployment; revisit for static export.
- **`lib/i18n.ts`** holds `Locale`, `localePath()`, the typed UI-string dictionary `t` (TS enforces en/es parity), and **`ES_INDEXABLE`** — the one switch for Spanish indexability. Flipping it to `false` noindexes all `/es` pages (via `esRobots`), drops hreflang on both sides (via `localizedAlternates`), and removes `/es` from the sitemap. It's pure data: safe to import from client components.
- **Spanish posts** live in `content/posts/es/<same-slug>.mdx`. Frontmatter rule: translate `title`, `description`, `tags`; keep `slug`, `date`, `updated`, `published` identical to the English twin — slug identity is the URL-mirror invariant. `pnpm new:post` creates English only; Spanish twins are authored manually (translated, not scaffolded).
- **Spanish archive posts** live in `content/last-click-city/es/<same-slug>.mdx`, same convention. Here the invariants are *enforced at parse time*: `loadPosts("es")` in `lib/last-click-city.ts` throws (failing `pnpm build`) unless the English twin exists and `date`, `originalUrl`, `thumbnail`, `author`, and `authorUrl` are byte-identical to it. Translate `title`, `description`, `excerptLead`, `excerpt`; leave fenced code blocks and image paths untouched (translate alt text only). Authorship never changes in translation — see the archive section below.
- **Translation disclosure.** `t[locale].article.translatedNote` is `null` for English (the source language) and a short note for Spanish; `ArticleLayout` and `ArchiveArticleLayout` render it with `components/ClaudeMark.tsx` whenever it is non-null, so English output is unaffected. The machine-readable half is `translator` on the es `blogPostingSchema`/`archivePostingSchema` — schema.org's `translator`, which deliberately leaves `author` alone.
- Shared components take `locale?: Locale = "en"`; giscus keeps `mapping="pathname"`, so `/es` posts get separate comment threads (changing the mapping would orphan existing English discussions). Server-returned API error strings stay English — known, accepted limitation.
- Cross-locale navigation is a full page load (multiple root layouts) — expected Next behavior, don't add middleware for it.

### Site config (`lib/site-config.ts`)

Single source of truth for site name, URL, nav, social links, and RSS path. Imported by the root layouts (metadata), the feed/sitemap/robots routes, the contact mailer (subject prefix), and the homepage. Update here, not in components.

`siteConfig.url` reads `NEXT_PUBLIC_SITE_URL`. It falls back to `localhost:3000` in dev and **throws in production builds** — every canonical, `og:url`, sitemap entry, and JSON-LD `@id` derives from it, so a missing value would publish wrong URLs to Google.

### SEO / metadata (`lib/seo.tsx`)

**Canonical URLs must be set per page, never on a root layout.** Next merges metadata shallowly per segment, so an `alternates.canonical` on a root layout is inherited *verbatim* by every child that doesn't define its own — which previously had `/blog`, `/about`, and all 44 archive pages declaring the homepage as their canonical. Neither root layout has a `canonical`; pages that exist in both locales call `localizedAlternates(enPath, locale)` (self-canonical + en/es/x-default hreflang cluster, gated by `ES_INDEXABLE`), and `canonical("/path")` is the no-hreflang fallback for a page whose twin may not exist. In `app/(en)/blog/[slug]/page.tsx` and `app/(en)/last-click-city/[slug]/page.tsx` the choice is conditional on the Spanish twin existing — an untranslated post must not emit hreflang at a 404. The archive index and the four category pages derive from shared data rather than translated files, so they call `localizedAlternates` unconditionally. Both helpers return the RSS `alternates.types` entry too (repeated per page, because a page-level `alternates` replaces the parent's instead of merging). Every `/es` page sets `robots: esRobots` (the other half of the `ES_INDEXABLE` flip).

The same shallow-merge rule applies to `openGraph` and `twitter`: a page that declares either gets *none* of its root layout's fields, and `app/(es)/layout.tsx` inherits nothing from `app/(en)/layout.tsx` (they're siblings). Set `siteName`, `locale`, `title`, `description`, and `url` explicitly whenever you override them.

JSON-LD goes through `<JsonLd schemas={[...]} />`, which wraps everything in one `@graph` so nodes cross-reference by `@id`. Repeat `personSchema()` on any page whose other nodes reference it — a cross-page `@id` is not guaranteed to resolve. Schema builders (`webSiteSchema`, `blogSchema`, `blogPostingSchema`, `profilePageSchema`, `breadcrumbSchema`) all live in `lib/seo.tsx`; add new ones there rather than inlining `<script type="application/ld+json">` in a page. `blogSchema`/`blogPostingSchema`/`profilePageSchema` and the archive builders (`archiveBlogSchema`/`archivePostingSchema`/`archiveCollectionSchema`) all take a locale; the posting builders emit `translationOfWork` pointing at the English article's `@id`, plus a `translator`, when the locale is `"es"`.

### OG images (`lib/og-image.tsx`)

Share cards are generated at build time by `next/og` via the file convention. `app/opengraph-image.tsx` is the site-wide (English) fallback; the `/blog`, `/about`, `/blog/[slug]`, `/last-click-city`, and `/last-click-city/[slug]` segments override it in both locale trees (the es variants live under `app/(es)/es/…` with translated copy and Spanish dates). **A page that declares its own `openGraph` metadata does not inherit a parent segment's `opengraph-image`** — so any new route with custom `openGraph` needs a co-located `opengraph-image.tsx` or it ships with no share image. A `[slug]` image file needs its own `generateStaticParams`.

**Hash-suffixed URLs:** because pages sit inside route groups, Next serves these images under hash-suffixed paths (`/blog/<slug>/opengraph-image-g58prh`). The `og:image`/`twitter:image` meta tags resolve automatically; the JSON-LD `image` URLs are built with Next's own `fillMetadataSegment` (private `next/dist` import in `lib/seo.tsx`) so they can't drift from what's actually served. The `segment` strings passed to it must match the real app-dir folders (group prefix included) — and re-verify after any Next upgrade, since it's a private API.

`renderOgImage()` uses next/og's built-in font rather than fetching Fraunces/Inter, keeping `next build` free of network calls. Colors mirror the Tailwind palette.

### Crawlability

- `app/robots.ts` names AI crawlers explicitly (answer engines and training crawlers are listed separately) because several treat a missing rule as ambiguous. To opt out of one, flip its `allow` to `disallow: "/"`.
- `app/llms.txt/route.ts` serves an [llmstxt.org](https://llmstxt.org) Markdown map of the site, generated from `getAllPosts()` so it can't drift from the sitemap and feed. The `## En español` section lists Spanish posts as translations, from `getAllPosts("es")`.
- `app/sitemap.ts` derives `lastModified` from post dates, never `new Date()` — a build timestamp makes every page look freshly modified on each deploy and trains crawlers to ignore `lastmod`. Only indexable URLs belong in it; a noindexed URL in a sitemap is a Search Console error. Paired en/es entries carry `alternates.languages` (serialized as `xhtml:link`), both `/es` lists are gated by `ES_INDEXABLE`, and es entries are included only when the slug exists on the English side. The es archive block sits one notch below the English priority ladder (0.4 / 0.3 / 0.2 against 0.5 / 0.4 / 0.3), and an es category's `lastModified` is the newest date among its *translated* members only.
- `/feed.xml` is deliberately English-only — no `/es` URLs in it, ever.

### The Last Click City archive is indexed

The 45 English archive URLs (index + 40 posts + 4 category listings) are indexable and in the sitemap, as is the full Spanish mirror under `/es/last-click-city`. `lastclick.city` lapsed and was re-registered by an unrelated site, so this is now the only place the content exists — there is no duplicate-content collision and nothing to redirect from.

Three things to preserve when touching it:

- **Authorship.** 17 of the 40 posts have an `author` in their frontmatter (a guest author); the other 23 are the site owner's. `archiveAuthor()` in `lib/seo.tsx` emits an inline `Person` for the former and an `@id` reference to the owner for the latter. Never default archive posts to the site owner. **Translation does not change this**: the es frontmatter copies `author`/`authorUrl` verbatim (enforced at parse time) and both the byline and the JSON-LD stay the original author's in both locales — the "translated with Claude" note is a disclosure, not a reassignment.
- **Pipeline separation.** `lib/last-click-city.ts` still must not be imported by the homepage, `/blog`, or the feed, in either locale. `app/sitemap.ts` is the one deliberate exception, and it keeps archive URLs in their own lists (en and es separately) rather than concatenating them into the live posts. `lib/seo.tsx` imports the `ArchivePost` type with `import type` so the file read never lands in a live page's bundle. `app/llms.txt/route.ts` mentions `/es/last-click-city` in a static sentence rather than importing the pipeline.
- **The dual-shape `[slug]` route.** Articles and the four category listings share one dynamic route in both locale trees. The category branch comes first in the page, in `generateMetadata`, and in the OG image, and the es tree must mirror that order. Category titles come from `archiveCategoryTitle(category, locale)` in `lib/i18n.ts` (an es override map over an English fallback) — never hand-edit the generated `lib/last-click-city.data.ts`.

### Static generation

`app/(en)/blog/[slug]/page.tsx` uses `generateStaticParams` → `getPublishedSlugs()` (the es twin uses `getPublishedSlugs("es")`). Combined with the `published` filter in prod, draft posts are not statically generated and `/blog/<draft-slug>` returns 404 in prod (via `notFound()`).

`/feed.xml` uses `dynamic = "force-static"` and re-filters by `published` defensively.

### Comments

`components/Comments.tsx` is a client component. If any of the four `NEXT_PUBLIC_GISCUS_*` env vars is missing, it renders a "Comments will be available soon." stub instead of giscus. Don't make the four vars conditional individually — they're all-or-nothing.

## Conventions

- **Adding a post**: always go through `pnpm new:post "Title"`. It slugifies, creates the MDX skeleton with `published: false`, and pre-creates `public/images/posts/<slug>/`. Images in posts are referenced with absolute paths (`/images/posts/<slug>/file.png`). The script creates the **English post only** — the Spanish twin in `content/posts/es/` is authored manually when (and if) the post is translated; until then the English page simply has no hreflang cluster.
- **Revising a published post**: add an optional `updated: "YYYY-MM-DD"` to the frontmatter. It feeds `og:modified_time`, schema.org `dateModified`, and the sitemap's `lastmod`, signalling a re-crawl. Use it for substantive rewrites, not typo fixes.
- **Tailwind theme**: custom palette (`paper`, `ink`, `rule`, `accent`) and two font CSS variables (`--font-inter` sans, `--font-fraunces` display) defined in `tailwind.config.ts` and wired in `components/RootShell.tsx`. The `@tailwindcss/typography` plugin is themed there too — long-form post styling lives in the `typography` extend, not in component classes.
- **Prettier**: `printWidth: 100`, double quotes, semicolons, trailing commas. `prettier-plugin-tailwindcss` is on, so class order is auto-sorted.
- **No client components unless necessary**: `Comments`, `SubscribeForm`, `ContactForm`, and `LanguageSwitcher` are the only `"use client"` files — everything else is RSC. Keep new code on the server side by default.
- **UI strings**: any string rendered by a shared component belongs in the `t` dictionary in `lib/i18n.ts` (both locales — the type enforces parity), not hardcoded. Keep cross-surface Spanish terms consistent: "Ensayos", "min de lectura" are used identically in the dictionary, pages, OG cards, and JSON-LD.
