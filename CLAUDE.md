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

`siteConfig.url` reads `NEXT_PUBLIC_SITE_URL` with an `example.com` fallback — the fallback is harmless in dev but should never reach prod.

### Static generation

`app/blog/[slug]/page.tsx` uses `generateStaticParams` → `getPublishedSlugs()`. Combined with the `published` filter in prod, draft posts are not statically generated and `/blog/<draft-slug>` returns 404 in prod (via `notFound()`).

`/feed.xml` uses `dynamic = "force-static"` and re-filters by `published` defensively.

### Comments

`components/Comments.tsx` is a client component. If any of the four `NEXT_PUBLIC_GISCUS_*` env vars is missing, it renders a "Comments will be available soon." stub instead of giscus. Don't make the four vars conditional individually — they're all-or-nothing.

## Conventions

- **Adding a post**: always go through `pnpm new:post "Title"`. It slugifies, creates the MDX skeleton with `published: false`, and pre-creates `public/images/posts/<slug>/`. Images in posts are referenced with absolute paths (`/images/posts/<slug>/file.png`).
- **Tailwind theme**: custom palette (`paper`, `ink`, `rule`, `accent`) and two font CSS variables (`--font-inter` sans, `--font-fraunces` display) defined in `tailwind.config.ts` and wired in `app/layout.tsx`. The `@tailwindcss/typography` plugin is themed there too — long-form post styling lives in the `typography` extend, not in component classes.
- **Prettier**: `printWidth: 100`, double quotes, semicolons, trailing commas. `prettier-plugin-tailwindcss` is on, so class order is auto-sorted.
- **No client components unless necessary**: `Comments`, `SubscribeForm`, and `ContactForm` are the only `"use client"` files — everything else is RSC. Keep new code on the server side by default.
