# Personal Website + Blog (Next.js MDX)

## Context

Roman's repo at `/Users/roman.prokashev/air/personal_website` is greenfield — only `content/posts/The_Marketing_Consequences/` exists with the first article (`The Marketing Consequences of Conway's Law.md`) and two of three referenced images. Goal: scaffold a clean, professional personal site + MDX blog that publishes from the repo, lets him collect newsletter signups and consulting inquiries, and accepts comments on posts. Stack and integrations are user-specified; constraints are: no CMS, no custom email delivery, no fictional bio content, Vercel-friendly, and the build must not break on missing images.

## Goal

Ship a working Next.js App Router + MDX site with: homepage (two-column desktop), `/blog` index, `/blog/[slug]` posts, `/about` with contact form, `/feed.xml` + `/sitemap.xml` + `/robots.txt`, Buttondown subscribe, Resend contact, giscus comments — with the existing Conway's Law article fully migrated and rendering.

## Approach

- **Framework**: Next.js 15 App Router, React 19, TypeScript strict, Tailwind v3 (stable + `@tailwindcss/typography`), pnpm.
- **MDX pipeline**: Files live in `content/posts/*.mdx` (outside `app/`). Parse frontmatter with `gray-matter`, validate with `zod`, compile MDX with `next-mdx-remote-client/rsc` (maintained fork; the original `next-mdx-remote` is archived). Reading time + slug helpers in `lib/`. Statically generated via `generateStaticParams`.
- **Style**: Inter via `next/font/google`. Muted-green links `#2F6B57` (Tailwind extended palette `accent`). Typography plugin for prose with overridden link/heading colors. No hero, no gradients, generous whitespace, visible focus rings.
- **Forms**: Route handlers (`/api/subscribe`, `/api/contact`) — keeps secrets server-side, matches user's spec. Honeypot + Zod on both. Buttondown duplicate-email errors silently map to success (don't leak list membership). Resend's `{ data, error }` return shape handled explicitly.
- **Comments**: `@giscus/react` rendered only when all four `NEXT_PUBLIC_GISCUS_*` env vars exist; otherwise a small "Comments will be available soon." message.
- **Image strategy**: Authors write absolute paths `/images/posts/<slug>/foo.png` and use standard markdown `![alt](path)`; an MDX components map rewrites `img` to a `next/image`-backed wrapper. For the Conway's Law article, only reference the two images that exist; the missing third becomes a `<!-- TODO -->` HTML comment.
- **SEO**: `app/sitemap.ts` + `app/robots.ts` (Next.js conventions). Hand-rolled minimal RSS 2.0 at `app/feed.xml/route.ts` (no extra dep). Per-post `generateMetadata` from frontmatter; `NEXT_PUBLIC_SITE_URL` drives canonical/OG URLs (placeholder `https://example.com` in `.env.example`).
- **Authoring**: `pnpm new:post "Title"` invokes `scripts/new-post.ts` (tsx) — slugify, write MDX skeleton with frontmatter (today's date, `published: false`, empty tags), open outline.
- **Confirmed answers from Roman**:
  - Trailing "Shared goals??" / "Conclusion" stubs → HTML-comment TODOs in the MDX (hidden from render).
  - About page + homepage sidebar bio → TODO placeholder blocks (no invented content).
  - `NEXT_PUBLIC_SITE_URL` → placeholder for now.
  - giscus repo → `prokashevroman/personal_website` (same as the site repo).

## File / Folder Structure

```
.
├── app/
│   ├── layout.tsx              # Root layout: font, header, footer, metadata defaults
│   ├── page.tsx                # Homepage — two-col grid (recent posts + sidebar)
│   ├── globals.css             # Tailwind base + prose overrides + focus styles
│   ├── blog/
│   │   ├── page.tsx            # /blog index — all published posts
│   │   └── [slug]/
│   │       └── page.tsx        # /blog/[slug] — ArticleLayout + MDX + Comments
│   ├── about/
│   │   └── page.tsx            # /about — bio TODO + Services TODO + ContactForm anchor #contact
│   ├── api/
│   │   ├── subscribe/route.ts  # POST → Buttondown
│   │   └── contact/route.ts    # POST → Resend
│   ├── feed.xml/route.ts       # RSS 2.0
│   ├── sitemap.ts              # /sitemap.xml
│   ├── robots.ts               # /robots.txt
│   └── not-found.tsx           # 404
│
├── components/
│   ├── Header.tsx              # Site nav (Home, Blog, About)
│   ├── Footer.tsx              # Copyright + RSS link + social links
│   ├── BlogPostCard.tsx        # Preview card: title, date, description, tags, reading time
│   ├── SubscribeForm.tsx       # Client component — Buttondown form w/ states + honeypot
│   ├── ContactForm.tsx         # Client component — Resend form w/ states + honeypot
│   ├── Comments.tsx            # giscus wrapper (renders nothing if env missing)
│   ├── ArticleLayout.tsx       # Article header (title/date/reading time/tags) + prose container
│   ├── MdxImage.tsx            # next/image wrapper used in MDX components map
│   └── mdx-components.tsx      # Exports the components map (img → MdxImage, etc.)
│
├── content/
│   └── posts/
│       └── the-marketing-consequences-of-conways-law.mdx
│
├── lib/
│   ├── posts.ts                # Load + parse + validate posts; getAllPosts, getPostBySlug
│   ├── mdx.ts                  # compileMDX wrapper w/ remark/rehype plugins + components map
│   ├── reading-time.ts         # words/200 wpm
│   ├── site-config.ts          # site name, URL, social, defaults
│   └── validation.ts           # Zod schemas: PostFrontmatter, SubscribeInput, ContactInput
│
├── scripts/
│   └── new-post.ts             # pnpm new:post "Title"
│
├── public/
│   ├── favicon.ico             # placeholder
│   └── images/
│       └── posts/
│           └── the-marketing-consequences-of-conways-law/
│               ├── image-1-silos.png
│               └── image-2-vertical-silos.png
│
├── .env.example                # All required env vars, documented
├── .gitignore                  # node_modules, .next, .env*.local, .DS_Store
├── README.md                   # Setup, deploy, publishing workflow, integration setup
├── next.config.mjs             # MDX page extension, image domains if needed
├── tailwind.config.ts          # Theme, typography plugin, accent green
├── postcss.config.mjs          # Tailwind + autoprefixer
├── tsconfig.json               # strict: true, paths
├── package.json                # scripts: dev/build/start/lint/typecheck/new:post
└── pnpm-lock.yaml
```

(`content/posts/The_Marketing_Consequences/` and the original `.md` are deleted after migration.)

## Dependencies

**Prod**: `next`, `react`, `react-dom`, `next-mdx-remote-client`, `gray-matter`, `zod`, `resend`, `@giscus/react`, `clsx`.

**Dev**: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `@tailwindcss/typography`, `eslint`, `eslint-config-next`, `tsx` (run TS scripts), `prettier`, `prettier-plugin-tailwindcss`.

No `reading-time`, no `feed`, no `@next/mdx` — all hand-rolled or replaced by the chosen MDX pipeline.

## Implementation Phases (each ends in a verifiable increment)

**Phase 1 — Scaffold + chrome.** Init Next.js 15 App Router + TS strict + Tailwind v3 + typography plugin. Add Inter via `next/font`. Build `Header`, `Footer`, root `layout.tsx`, `globals.css`. Define `lib/site-config.ts`. Verify: `pnpm dev` renders a page with header/footer and Inter font; muted-green link visible.

**Phase 2 — Content system.** Write `lib/validation.ts` (Zod `PostFrontmatter`), `lib/reading-time.ts`, `lib/posts.ts` (read `content/posts/*.mdx`, parse, validate, sort by date desc, filter unpublished in production via `process.env.NODE_ENV`), `lib/mdx.ts` (compile + components map), `components/MdxImage.tsx`, `components/mdx-components.tsx`. Verify: temporary debug log of `getAllPosts()` returns the migrated article.

**Phase 3 — Article migration.** Create `public/images/posts/the-marketing-consequences-of-conways-law/` with the two PNGs copied + renamed (`image-1-silos.png`, `image-2-vertical-silos.png`). Write the new `.mdx` file at `content/posts/the-marketing-consequences-of-conways-law.mdx` with the transforms below. Delete `content/posts/The_Marketing_Consequences/` and the `.DS_Store`. Verify by reading the new file end-to-end.

**Phase 4 — Routes.**
- `app/page.tsx`: CSS grid `lg:grid-cols-3`, recent posts (limit 5–10) span 2 cols, sidebar (bio TODO + `SubscribeForm` + consulting CTA → `/about#contact`) spans 1 col. Stacks on mobile.
- `app/blog/page.tsx`: list all published posts using `BlogPostCard`.
- `app/blog/[slug]/page.tsx`: `generateStaticParams`, `generateMetadata`, `ArticleLayout` wrapping compiled MDX + `Comments`.

Verify: navigate all three routes locally, article renders with images.

**Phase 5 — SEO.** `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/route.ts` (hand-rolled RSS 2.0 with `Content-Type: application/xml`). Per-post metadata via `generateMetadata`. `<link rel="alternate" type="application/rss+xml">` in root layout. Verify: open `/feed.xml`, `/sitemap.xml`, `/robots.txt` — all valid.

**Phase 6 — Forms + API.**
- `SubscribeForm` + `app/api/subscribe/route.ts` → Buttondown POST to `https://api.buttondown.com/v1/subscribers` with `Authorization: Token <key>`. Zod email validate. Honeypot. Map Buttondown 400 "already subscribed" to success.
- `ContactForm` + `app/api/contact/route.ts` → Resend `emails.send`. Zod validate (name, email, optional company, message ≥ 20 chars). Honeypot. Check `error` from Resend response explicitly.
- Mount `SubscribeForm` in homepage sidebar (and optionally below `ArticleLayout`).
- Mount `ContactForm` in `app/about/page.tsx` under `#contact` anchor.

Verify: submit each form with stub env vars locally; success/error states render. With real keys: end-to-end delivery.

**Phase 7 — Comments.** `components/Comments.tsx` — read four `NEXT_PUBLIC_GISCUS_*` env vars; if all present, render `<Giscus>` (light theme matching site); else render `<p>Comments will be available soon.</p>`. Mount under article body. Verify: with env vars unset, fallback shows; with them set in `.env.local`, giscus iframe loads.

**Phase 8 — Authoring + docs.** `scripts/new-post.ts` (tsx) — slugify title, write MDX skeleton. Add `"new:post": "tsx scripts/new-post.ts"` to `package.json`. Author `README.md` (sections: Local dev, Env vars, Adding a post, Deploying to Vercel, Custom domain, Buttondown setup + RSS-to-email, Resend setup + domain verification, giscus setup, Production checklist). Author `.env.example`. Verify: `pnpm new:post "Test Title"` creates a valid MDX file. `pnpm lint && pnpm typecheck && pnpm build` all pass.

## Article Migration — Concrete Transforms

Source: `content/posts/The_Marketing_Consequences/The Marketing Consequences of Conway's Law.md`
Target: `content/posts/the-marketing-consequences-of-conways-law.mdx`

Frontmatter:
```yaml
---
title: "The Marketing Consequences of Conway's Law"
slug: "the-marketing-consequences-of-conways-law"
date: "2026-06-06"
description: "Conway's Law — that organizations design systems mirroring their communication structures — applies to marketing just as much as to software. Observations from 15+ years of working inside marketing teams of every size."
tags: ["marketing", "strategy", "organizations"]
published: true
---
```

Transforms:
1. **Drop the duplicate H1** — `ArticleLayout` renders the title from frontmatter.
2. **Fix malformed headings** like `1. ## **Conway's Law in Multi-Product Marketing**` (numbered list + heading + bold all stacked) → plain `## 1. Conway's Law in Multi-Product Marketing`.
3. **Fix typo** "communiication" → "communication".
4. **Rebuild the brand-architecture comparison** (currently a one-row markdown table) as a proper 3-column GFM table with header row: Yahoo / P&G / Apple, with the products listed under each.
5. **Replace the two "Image illustrating" placeholders** with markdown image syntax pointing to the moved files:
   - After "Implications #2 (Centralized Marketing)": `![Silos in products and central marketing function, and how they interact](/images/posts/the-marketing-consequences-of-conways-law/image-1-silos.png)`
   - After "Implications #4 (Vertical)": `![Vertical silos between leadership and middle/lower layers](/images/posts/the-marketing-consequences-of-conways-law/image-2-vertical-silos.png)`
6. **For the third missing image** (brand architecture): replace the "Image illustrating" line with `<!-- TODO: add brand architecture diagram -->`.
7. **Trailing stubs** "Shared goals??" and "Conclusion" → wrap in `<!-- ... -->` so they don't render.
8. Preserve all other content (links, lists, bold/italic, quote, the substantive prose) exactly.

Image rename (clearer naming):
- `Image_1_siloses.png` → `public/images/posts/the-marketing-consequences-of-conways-law/image-1-silos.png`
- `Image_2_vertical_silos.png` → `public/images/posts/the-marketing-consequences-of-conways-law/image-2-vertical-silos.png`

## `.env.example` (committed)

```
NEXT_PUBLIC_SITE_URL=https://example.com

BUTTONDOWN_API_KEY=
BUTTONDOWN_NEWSLETTER_ID=

RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=

NEXT_PUBLIC_GISCUS_REPO=prokashevroman/personal_website
NEXT_PUBLIC_GISCUS_REPO_ID=
NEXT_PUBLIC_GISCUS_CATEGORY=
NEXT_PUBLIC_GISCUS_CATEGORY_ID=
```

## Acceptance Criteria

- [ ] `pnpm install` and `pnpm dev` boot the site at `http://localhost:3000` without errors.
- [ ] Homepage shows two-column desktop layout (posts ~⅔, sidebar ~⅓) and stacks on viewport <`lg`.
- [ ] The Conway's Law article appears on `/`, on `/blog`, and renders at `/blog/the-marketing-consequences-of-conways-law` with the two available images visible.
- [ ] Removing one of the article images and rebuilding does not crash the build (`next/image` errors visibly but doesn't fail the build; missing referenced images surface as broken `<img>` not as exceptions).
- [ ] `pnpm new:post "Another Post"` creates `content/posts/another-post.mdx` with valid frontmatter and `published: false`.
- [ ] `/feed.xml` returns valid RSS 2.0 with `Content-Type: application/xml` and includes the Conway's Law post.
- [ ] `/sitemap.xml` and `/robots.txt` return valid responses, sitemap includes `/`, `/blog`, `/about`, and each published post URL.
- [ ] `POST /api/subscribe` with a valid email succeeds; with invalid email returns 400; honeypot-filled requests return 200 (silent drop).
- [ ] `POST /api/contact` with valid input + `RESEND_API_KEY` set delivers to `CONTACT_TO_EMAIL`; invalid input returns 400; honeypot-filled returns 200.
- [ ] Comments section renders a placeholder message when giscus env vars are absent; renders the giscus iframe when all four are set.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass with zero errors.
- [ ] No secrets in the repo (`.env*.local` gitignored; only `.env.example` committed).

## Verification Steps

Local:
```
pnpm install
pnpm dev                                  # visit /, /blog, /blog/the-marketing-consequences-of-conways-law, /about
pnpm new:post "Test Draft"                # confirm a new MDX file is written with published: false
pnpm typecheck && pnpm lint && pnpm build # all must pass
curl -s localhost:3000/feed.xml | head    # valid RSS
curl -s localhost:3000/robots.txt         # valid robots
curl -s localhost:3000/sitemap.xml | head # valid sitemap
```

Form sanity (without keys): submit empty → 400; submit good email → 200 (Buttondown will fail upstream — server logs the error but client sees success message because we don't want to leak details). With real keys: receive welcome email / contact email respectively.

Visual: confirm the two-column homepage on a desktop viewport, stacked on mobile; confirm muted-green links and Inter font; confirm focus rings on Tab; confirm the article images load.

## Risks & Mitigations

1. **Tailwind v4 vs v3** — v4 is current but has a different config surface; v3 is more stable and matches every tutorial/snippet. Choosing v3. If user later wants v4, migration is straightforward.
2. **`next-mdx-remote` archived** — using the maintained fork `next-mdx-remote-client` instead. API is essentially the same; pinning a major version.
3. **Resend domain verification** — `CONTACT_FROM_EMAIL` must be on a domain verified in the Resend dashboard or sends will be rejected. Documented in README.
4. **Buttondown duplicate-email leak** — silently mapping 400 "already subscribed" to success so the form doesn't reveal who's on the list.
5. **Image sizing** — `next/image` needs `width`/`height` or `fill`. The `MdxImage` wrapper will read dimensions from a small server-side `image-size` lookup at build time, or fall back to fixed reasonable defaults (e.g. width 800) if that's awkward. If dimensions become a problem, switch to plain `<img>` for MDX images and accept LCP cost.
6. **Smart quotes in title** — the source uses curly apostrophe `'`. Frontmatter and React will pass it through fine; just need to make sure URL slug uses straight `'s` (handled by slugify).
7. **`generateStaticParams` and unpublished filtering** — make sure both `generateStaticParams` and `getPostBySlug` filter on `published` in production but allow drafts in dev (so the user can preview).
8. **giscus theme** — set explicitly to `light` or auto; otherwise it inherits CSS variables that may not exist.
9. **Vercel + custom domain** — set `NEXT_PUBLIC_SITE_URL` to the production domain in Vercel env (Production scope) so canonical URLs and the sitemap don't point to a preview URL.
10. **No rate limiting on `/api/contact`** — only honeypot + min length. Documented as known limitation; Upstash Ratelimit is a future addition.
11. **`generateStaticParams` for `/blog/[slug]`** — return only published slugs in production so unpublished posts are not statically built.
12. **MDX content security** — only Roman authors MDX so untrusted-MDX risks don't apply, but still avoid passing user data into `compileMDX`.
13. **Pre-existing `.DS_Store` files** — gitignore catches future ones; existing ones get removed in Phase 3.

## After Implementation (deliverables to share back)

1. Final file/folder tree (`tree` output or equivalent).
2. "How to add your next article" — `pnpm new:post "Title"` → edit MDX → flip `published: true` → commit → push.
3. Required env vars and where each one comes from (Buttondown dashboard, Resend dashboard, giscus.app config wizard, Vercel project settings).
4. Deploy-to-Vercel steps (import repo, set env vars, deploy, add custom domain, set `NEXT_PUBLIC_SITE_URL`).
5. Provider-specific setup (Buttondown: paste RSS URL into "RSS-to-email"; Resend: verify sending domain; giscus: enable Discussions + run giscus.app config wizard + paste IDs into env).
