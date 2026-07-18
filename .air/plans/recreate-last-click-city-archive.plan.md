# Plan: Recreate the "Last Click City" blog archive under `/last-click-city/`

## Context
Roman dropped his previous blog (hosted at **lastclick.city**, 2019–2024) into `content/last_click_city_archive/public_html/` as a raw Mobirise export (full HTML pages + Bootstrap/theme assets + images). He wants it recreated on the current Next.js site under `/last-click-city/` so the writing is preserved and browsable, **without** surfacing it in any navigation or discovery surface yet. Per his answer, the archive must *look like the old blog* but run on the *current, sustainable engine* (Next.js App Router + MDX + RSC + reusable components); content is stored as **MDX** (editable/sustainable).

## What I found in the archive folder
Root: `content/last_click_city_archive/public_html/` (~37 MB). Ignore `__MACOSX/`, all `assets/{bootstrap,dropdown,formoid,mobirise,parallax,popper,smoothscroll,socicon,tether,theme,touchswipe,web}` (JS/CSS/fonts), `project.mobirise`, `assets/images/hashes.json`, `sitemap.xml`, `google931a1876fc2f55cb.html`.

**46 HTML files = 40 articles + 1 pillar (`index.html`) + 4 category pages + 1 verification stub.** (There are exactly **40** article files.)
- **Pillar** `index.html`: cityscape parallax hero "LAST CLICK CITY / Digital analytics blog" → "Latest posts" → reverse-chron grid of **all 40** cards (thumbnail `For_index_page_N.png` + h2 title + date + `<strong>` lead + `Continue reading` link) → footer CATEGORIES + LINKS.
- **4 category pages** (`attribution-models`, `google-analytics`, `google-bigquery`, `google-tag-manager` `.html`): same shell + a curated subset of the same cards; all `<meta name="robots" content="noindex">`.
- **40 articles**: shell wrapping `section.content6 .mbr-section-text`: h2 title, `<p>` date ("Month D, YYYY"), `rrssb` social buttons (chrome—drop), optional `An article by <a>Sergey Matrosov</a>` byline (**17 of 40** by guest author Sergey Matrosov; 23 no byline = Roman), `<strong>` lead + prose, inline `<img src="assets/images/<Folder>/<file>">`, `<pre class="prettyprint"><code class="language-X">` code, and (6 files) `<table>`. Body ends before `#disqus_thread` + `footer3`.

**Body detail:** code langs `sql`×76, `javascript`×12, `python`×8, `bsh`×4 (→`bash`). Tables in 6 files (`bigquery-totals-by-day…`, `bigquery-user-defined-functions`, `marketing-budget-allocation…`, `how-to-work-in-google-bigquery-using-sql`, `how-to-set-up-events-in-google-analytics-4-correctly`, `user-journey-…-appsflyer-data`). Dates recovered for all 40. Internal links: relative `slug.html`, `index.html`, `https://lastclick.city`; external links stay. Images: 256 PNG + 24 JPG in 34 topic folders + root thumbnails/hero/logos; **no SVG/WebP among article images** (so `MdxImage` reads all dimensions). **4 filenames contain spaces** → rename spaces→`_`.

**Old-blog visual identity (to replicate):** font **Rubik**; blue **`#149dcc`** (links), pink `#ff3366` (hover `#cc0033`); text `#333333`/`#767676`; hero bg `city-1879x701v3.png`; card = left thumbnail (~60%) + right title/date/excerpt/"Continue reading".

## Proposed route structure (45 URLs)
| New URL | Source | Type |
|---|---|---|
| `/last-click-city/` | `index.html` | Pillar: hero + all-40 cards + category links + banner |
| `/last-click-city/attribution-models/` | `attribution-models.html` | Category listing |
| `/last-click-city/google-analytics/` | `google-analytics.html` | Category listing |
| `/last-click-city/google-bigquery/` | `google-bigquery.html` | Category listing |
| `/last-click-city/google-tag-manager/` | `google-tag-manager.html` | Category listing |
| `/last-click-city/<article-slug>/` ×40 | each article `*.html` | Article (banner + title/date/byline + MDX prose) |

Slug = original filename without `.html` (matches old `og:url`); no category/article slug collisions.

## Goal
Recreate all 45 archive pages under `/last-click-city/` as MDX-backed routes that visually evoke the old blog, are isolated from every discovery surface, and are reachable only by direct URL — each topped by a reusable archive banner.

## Approach
Build a **self-contained archive module** parallel to (never wired into) the existing posts pipeline, so nothing leaks into homepage/`/blog`/`sitemap.xml`/`feed.xml`/nav — isolation by construction. Convert each article's HTML body to an editable `.mdx` file rendered through the existing `RenderMdx`/`MdxImage`. Apply the old-blog look via a **scoped** stylesheet + `.lcc-archive` wrapper + `next/font` Rubik, leaving the global theme/site untouched. Keep the global `Header`/`Footer` (removing them needs a risky root-layout refactor — out of scope); the banner ribbon marks the section.

**Reuse:** `lib/mdx.tsx` `RenderMdx` + `components/mdx-components.tsx` + `components/MdxImage.tsx`; `gray-matter`+`zod`+`lib/reading-time.ts` (same pattern as `lib/posts.ts`); Tailwind `prose` re-themed via `--tw-prose-*` overrides inside `.lcc-archive`; `MdxImage` absolute-`/images/...` convention.

## File changes
**Create — content (importer output, committed as source of truth):**
- `content/last-click-city/<slug>.mdx` ×40 — frontmatter `title, slug, date`(YYYY-MM-DD)`, description, author?, authorUrl?, originalUrl, thumbnail?, excerpt?` + converted Markdown body.
- `public/images/last-click-city/**` — only referenced images (topic folders + used thumbnails + `city-1879x701v3.png`), spaces→`_`.

**Create — archive module (code):**
- `lib/last-click-city.ts` — isolated pipeline (`archivePostFrontmatterSchema`, `getArchivePosts/Slugs/BySlug`, `getCategoryBySlug`) + committed `CATEGORIES` constant (`{slug,title,articleSlugs[]}`×4). **No `published`/prod filter; never imported by sitemap/feed/home/blog.**
- `app/last-click-city/layout.tsx` — loads Rubik (`next/font`), imports scoped CSS, wraps in `.lcc-archive`, renders `<ArchiveBanner/>` once (banner on every archive page, DRY), sets `robots:{index:false,follow:false}` for the segment ("for now"; reversible).
- `app/last-click-city/page.tsx` — pillar (hero + "Latest posts" + all-40 cards + category links).
- `app/last-click-city/[slug]/page.tsx` — **articles + 4 category pages** in one route; `generateStaticParams` = article + category slugs; category → listing, else `getArchivePostBySlug` → `ArchiveArticleLayout`+`RenderMdx`, else `notFound`; `generateMetadata` from frontmatter/category.
- `app/last-click-city/archive.css` — scoped old-blog styles under `.lcc-archive` (Rubik, blue links via `--tw-prose-*`, hero, `.lcc-card`, category nav). No global leakage.
- `components/ArchiveBanner.tsx` — reusable ribbon, exact text: **"This is an archive of the Last Click City blog, which was published at lastclick.city from 2019 to 2024."**
- `components/archive/ArchiveHero.tsx`, `ArchiveCard.tsx`, `ArchiveArticleLayout.tsx` (no "AI helps polish" disclaimer, no giscus).

**Create — one-off importer (reproducible):**
- `scripts/import-last-click-city.ts` — parses 40 articles + `index.html` + 4 category HTMLs, writes `.mdx` + `CATEGORIES`, copies/renames images, rewrites links/paths.
- `package.json` — add devDep `node-html-parser` + `pnpm import:lcc`. Task-scoped; removable post-import (MDX/images remain the source; no runtime dep added).

**Modify:** possibly `tailwind.config.ts` `content` glob for the MDX dir (only if needed — likely not). **Nothing else** — `site-config.ts` nav, `Header.tsx`, `app/page.tsx`, `app/blog/*`, `app/sitemap.ts`, `app/feed.xml/route.ts`, `app/robots.ts`, `lib/posts.ts` untouched (req. 5 & 10).

## Conversion rules (HTML body → MDX), per article
1. Extract `section.content6 .mbr-section-text`; cut at first of `#disqus_thread`/`footer3`. Pull title, date (→ISO), description, `originalUrl` (og:url), byline. Drop `rrssb`/nav/hero/footer/scripts; keep `<strong>` lead as first paragraph.
2. Code: `<pre class=prettyprint><code class="language-X">` → fenced ```X (`bsh`→`bash`), entity-decoded verbatim.
3. Images: `assets/images/<Folder>/<file>` → `/images/last-click-city/<Folder>/<file>` (spaces→`_`).
4. Tables → GFM (`remark-gfm` enabled).
5. Inline `<b>/<strong>`→`**`, `<i>/<em>`→`*`; `&#8226;` bullet runs → `-` lists; decode entities; drop stray `<u>`.
6. Links: `X.html`→`/last-click-city/X`; `index.html`/`lastclick.city`→`/last-click-city`; external unchanged.
7. MDX-safety: escape stray `<`/`{`/`}` in prose; verified by per-article rendering.
Category membership + thumbnails + excerpts read from `index.html`/category HTML during import.

## Implementation steps
1. **Scaffold+banner:** add devDep/script; `ArchiveBanner`, `archive.css`, `layout.tsx` (Rubik, banner, noindex), placeholder page → verify `/last-click-city/`.
2. **Importer+content:** write/run `scripts/import-last-click-city.ts` → 40 `.mdx`, `CATEGORIES`, copied/renamed images; add `lib/last-click-city.ts`.
3. **Render:** `ArchiveHero/Card/ArticleLayout`; real pillar `page.tsx` + `[slug]/page.tsx`.
4. **Fixes:** grep generated MDX for leftover `.html`/`lastclick.city`/`assets/images`; thumbnail fallbacks; confirm 17 Sergey bylines.
5. **Verify** + write report.

## Acceptance criteria
- `pnpm typecheck` + `pnpm build` pass; build generates **45** archive routes.
- `/last-click-city/` shows hero, "Latest posts", 40 cards (thumbnail+title+date+excerpt+working link) + category links.
- Each of 4 category URLs renders its subset; all 40 article pages render title, correct date, byline where original had one, prose, images, fenced code (right language), tables (6).
- Banner with exact text at top of **every** archive page via the single `ArchiveBanner`.
- **Zero** archive entries in Header nav, homepage, `/blog`, `sitemap.xml`, `feed.xml`.
- No internal archive link points to `*.html`/`lastclick.city`.
- Rest of site visually unchanged.

## Verification steps
1. `pnpm typecheck`; `pnpm build` (log lists 45 `/last-click-city/*`).
2. `pnpm dev` spot-checks: `markov-chain-attribution-model` (python+images+byline), `how-to-work-in-google-bigquery-using-sql` (SQL+table), `user-journey-…-appsflyer-data` (25 images+tables), `six-differences-…` (no byline), `mcf-acquisition-…` (2019).
3. Click pillar→category→article + an in-body internal link; all resolve in `/last-click-city/`.
4. Isolation: inspect built `/sitemap.xml`, `/feed.xml`, `/`, `/blog`, header — no archive URLs; confirm `<meta name=robots noindex>` on archive.
5. If available, `mcp__Air__application-preview-open` to confirm look + banner.

## Requirements coverage
1✓(45 URLs) 2✓(titles/content/dates/hierarchy/slugs/formatting/images/links/bylines) 3✓(old look+modern engine) 4✓(links rewritten) 5✓(isolated) 6✓(direct URL) 7✓(exact ribbon) 8✓(reusable `ArchiveBanner`) 9✓(conversion-only) 10✓(no unrelated changes).

## Risks & mitigations
- **HTML→MDX fidelity:** parser-based import + per-article render checks; req. 9 permits formatting/render fixes; text copied verbatim.
- **Spaced filenames (4):** rename to `_`.
- **Missing index thumbnail/excerpt:** fallback logo + MDX-lead excerpt.
- **devDep addition:** importer-only, removable post-import; no runtime dep.
- **Global Header/Footer stay on archive pages:** intentional (avoids risky root refactor); banner marks the archive — flagged for review.

## Post-implementation report (to deliver)
All 45 created URLs; anything not fully reconstructable (+reason); assumptions (MDX; noindex "for now"; bullet→list; space→`_`; kept global Header/Footer; no Disqus/giscus); and explicit confirmation that no links were added to nav/homepage/blog/sitemap/feed.