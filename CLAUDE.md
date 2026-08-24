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

Posts are MDX files in `content/posts/`. The pipeline is:

1. `listMdxFiles()` reads `content/posts/*.mdx` synchronously from disk.
2. `parseFile()` runs gray-matter, then validates frontmatter against `postFrontmatterSchema` (zod). **Invalid frontmatter throws** — this fails the build, which is intentional.
3. The slug comes from the **frontmatter field, not the filename**. The two happen to match because `scripts/new-post.ts` creates them that way, but `getPostBySlug` looks up by frontmatter slug.
4. **Critical prod/dev divergence**: when `NODE_ENV === "production"`, `getAllPosts`, `getPublishedSlugs`, and `getPostBySlug` filter out `published: false`. In dev, drafts are visible. This single switch drives draft-hiding across the homepage, `/blog`, `/sitemap.xml`, `/feed.xml`, and `generateStaticParams` in `app/blog/[slug]/page.tsx`. Anything new that lists posts should call these functions — do not re-implement the filter.

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

### Site config (`lib/site-config.ts`)

Single source of truth for site name, URL, nav, social links, and RSS path. Imported by `app/layout.tsx` (metadata), the feed/sitemap/robots routes, the contact mailer (subject prefix), and the homepage. Update here, not in components.

`siteConfig.url` reads `NEXT_PUBLIC_SITE_URL`. It falls back to `localhost:3000` in dev and **throws in production builds** — every canonical, `og:url`, sitemap entry, and JSON-LD `@id` derives from it, so a missing value would publish wrong URLs to Google.

### SEO / metadata (`lib/seo.tsx`)

**Canonical URLs must be set per page, never on the root layout.** Next merges metadata shallowly per segment, so an `alternates.canonical` on `app/layout.tsx` is inherited *verbatim* by every child that doesn't define its own — which previously had `/blog`, `/about`, and all 44 archive pages declaring the homepage as their canonical. The root layout deliberately has no `canonical`; each page calls `canonical("/path")` from `lib/seo.tsx`, which returns the self-canonical **plus** the RSS `alternates.types` entry (repeated per page, because a page-level `alternates` replaces the parent's instead of merging).

The same shallow-merge rule applies to `openGraph` and `twitter`: a page that declares either gets *none* of the root layout's fields. Set `siteName`, `locale`, `title`, `description`, and `url` explicitly whenever you override them.

JSON-LD goes through `<JsonLd schemas={[...]} />`, which wraps everything in one `@graph` so nodes cross-reference by `@id`. Repeat `personSchema()` on any page whose other nodes reference it — a cross-page `@id` is not guaranteed to resolve. Schema builders (`webSiteSchema`, `blogSchema`, `blogPostingSchema`, `profilePageSchema`, `breadcrumbSchema`) all live in `lib/seo.tsx`; add new ones there rather than inlining `<script type="application/ld+json">` in a page.

### OG images (`lib/og-image.tsx`)

Share cards are generated at build time by `next/og` via the file convention. `app/opengraph-image.tsx` is the site-wide fallback; `app/blog/opengraph-image.tsx`, `app/about/opengraph-image.tsx`, and `app/blog/[slug]/opengraph-image.tsx` override it. **A page that declares its own `openGraph` metadata does not inherit a parent segment's `opengraph-image`** — so any new route with custom `openGraph` needs a co-located `opengraph-image.tsx` or it ships with no share image.

`renderOgImage()` uses next/og's built-in font rather than fetching Fraunces/Inter, keeping `next build` free of network calls. Colors mirror the Tailwind palette.

### Crawlability

- `app/robots.ts` names AI crawlers explicitly (answer engines and training crawlers are listed separately) because several treat a missing rule as ambiguous. To opt out of one, flip its `allow` to `disallow: "/"`.
- `app/llms.txt/route.ts` serves an [llmstxt.org](https://llmstxt.org) Markdown map of the site, generated from `getAllPosts()` so it can't drift from the sitemap and feed.
- `app/sitemap.ts` derives `lastModified` from post dates, never `new Date()` — a build timestamp makes every page look freshly modified on each deploy and trains crawlers to ignore `lastmod`. Only indexable URLs belong in it; a noindexed URL in a sitemap is a Search Console error.

### The Last Click City archive is indexed

The 45 archive URLs (index + 40 posts + 4 category listings) are indexable and in the sitemap. `lastclick.city` lapsed and was re-registered by an unrelated site, so this is now the only place the content exists — there is no duplicate-content collision and nothing to redirect from.

Two things to preserve when touching it:

- **Authorship.** 17 of the 40 posts have an `author` in their frontmatter (a guest author); the other 23 are the site owner's. `archiveAuthor()` in `lib/seo.tsx` emits an inline `Person` for the former and an `@id` reference to the owner for the latter. Never default archive posts to the site owner.
- **Pipeline separation.** `lib/last-click-city.ts` still must not be imported by the homepage, `/blog`, or the feed. `app/sitemap.ts` is the one deliberate exception, and it keeps archive URLs in their own list rather than concatenating them into the live posts. `lib/seo.tsx` imports the `ArchivePost` type with `import type` so the 40-file read never lands in a live page's bundle.

### Static generation

`app/blog/[slug]/page.tsx` uses `generateStaticParams` → `getPublishedSlugs()`. Combined with the `published` filter in prod, draft posts are not statically generated and `/blog/<draft-slug>` returns 404 in prod (via `notFound()`).

`/feed.xml` uses `dynamic = "force-static"` and re-filters by `published` defensively.

### Comments

`components/Comments.tsx` is a client component. If any of the four `NEXT_PUBLIC_GISCUS_*` env vars is missing, it renders a "Comments will be available soon." stub instead of giscus. Don't make the four vars conditional individually — they're all-or-nothing.

## Conventions

- **Adding a post**: always go through `pnpm new:post "Title"`. It slugifies, creates the MDX skeleton with `published: false`, and pre-creates `public/images/posts/<slug>/`. Images in posts are referenced with absolute paths (`/images/posts/<slug>/file.png`).
- **Revising a published post**: add an optional `updated: "YYYY-MM-DD"` to the frontmatter. It feeds `og:modified_time`, schema.org `dateModified`, and the sitemap's `lastmod`, signalling a re-crawl. Use it for substantive rewrites, not typo fixes.
- **Tailwind theme**: custom palette (`paper`, `ink`, `rule`, `accent`) and two font CSS variables (`--font-inter` sans, `--font-fraunces` display) defined in `tailwind.config.ts` and wired in `app/layout.tsx`. The `@tailwindcss/typography` plugin is themed there too — long-form post styling lives in the `typography` extend, not in component classes.
- **Prettier**: `printWidth: 100`, double quotes, semicolons, trailing commas. `prettier-plugin-tailwindcss` is on, so class order is auto-sorted.
- **No client components unless necessary**: `Comments`, `SubscribeForm`, and `ContactForm` are the only `"use client"` files — everything else is RSC. Keep new code on the server side by default.
