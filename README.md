# Personal Website

Personal site and blog for Roman Prokashev. Next.js 15 App Router + MDX,
deployed to Vercel. Newsletter via Buttondown, contact form via Resend,
comments via giscus.

## Local development

```bash
pnpm install
cp .env.example .env.local      # fill in keys you need
pnpm dev                        # http://localhost:3000
```

Useful scripts:

```bash
pnpm typecheck    # tsc --noEmit
pnpm lint         # next lint
pnpm build        # production build
pnpm start        # run the production build
pnpm new:post "Title"   # scaffold content/posts/<slug>.mdx
```

## Adding a post

1. `pnpm new:post "How marketing teams actually scale"` — creates
   `content/posts/how-marketing-teams-actually-scale.mdx` with
   `published: false` plus an empty image folder at
   `public/images/posts/how-marketing-teams-actually-scale/`.
2. Edit the frontmatter (`description`, `tags`) and write the post body.
3. Drop images into the post's folder and reference them with an absolute
   path: `![alt text](/images/posts/<slug>/file.png)`.
4. When ready, flip `published: true` and commit. Pushing to `main`
   triggers a Vercel deploy.

While `published: false`, the post is visible in `pnpm dev` but hidden in
the production build (it won't appear in `/`, `/blog`, `/sitemap.xml`,
`/feed.xml`, or be statically generated).

## Environment variables

Place these in `.env.local` for development and in the Vercel project
settings (Production scope) for the live site.

| Variable                          | What it is                                            | Where to get it                          |
| --------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | Canonical origin used in metadata, sitemap, feed.     | The deployed URL (e.g. https://…)         |
| `BUTTONDOWN_API_KEY`              | Server-only key for the newsletter subscribe handler. | Buttondown → Settings → API              |
| `BUTTONDOWN_NEWSLETTER_ID`        | Optional; reserved if multiple lists are added.       | Buttondown                               |
| `RESEND_API_KEY`                  | Server-only key for the contact form.                 | Resend → API Keys                        |
| `CONTACT_TO_EMAIL`                | Address that receives contact form messages.          | Your inbox                               |
| `CONTACT_FROM_EMAIL`              | "From" address — must be on a verified Resend domain. | Resend → Domains                         |
| `NEXT_PUBLIC_GISCUS_REPO`         | `prokashevroman/personal_website`                     | See giscus.app                           |
| `NEXT_PUBLIC_GISCUS_REPO_ID`      | Repo node ID from giscus.app                          | giscus.app config wizard                 |
| `NEXT_PUBLIC_GISCUS_CATEGORY`     | Discussions category name                             | giscus.app config wizard                 |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID`  | Discussions category ID                               | giscus.app config wizard                 |

If any of the four `NEXT_PUBLIC_GISCUS_*` variables is unset, the
Comments section falls back to a "Comments will be available soon."
notice instead of trying to render giscus.

## Deploying to Vercel

1. Import the repo in Vercel.
2. Framework preset: Next.js (auto-detected).
3. Add the env vars from the table above. Use the **Production** scope
   for the production URL and **Preview** for branches.
4. Deploy. After the first deploy, add the custom domain in Vercel and
   update `NEXT_PUBLIC_SITE_URL` to match.

## Provider setup

### Buttondown (newsletter)

1. Create a Buttondown account.
2. Settings → API → copy the key into `BUTTONDOWN_API_KEY`.
3. Settings → RSS-to-email → paste
   `https://<your-domain>/feed.xml` so new posts are sent
   automatically to subscribers.

### Resend (contact form)

1. Create a Resend account.
2. Add and verify the sending domain (DNS records). Until verified,
   `resend.emails.send` returns an error and the contact form will
   show a failure state.
3. Create an API key → `RESEND_API_KEY`.
4. Set `CONTACT_FROM_EMAIL` to an address on the verified domain
   (e.g. `hello@yourdomain.com`).

### giscus (comments)

1. Enable **Discussions** on `prokashevroman/personal_website` in
   GitHub repo settings.
2. Install the giscus app for the repo: <https://github.com/apps/giscus>.
3. Run the giscus configuration wizard at <https://giscus.app>. Use
   "Discussion title contains page slug" — the `Comments` component
   passes the post slug as the term.
4. Copy the four `data-*` values into the `NEXT_PUBLIC_GISCUS_*`
   environment variables.

## Production checklist

- [ ] `NEXT_PUBLIC_SITE_URL` is the public production URL.
- [ ] Buttondown key + RSS-to-email configured against the live feed.
- [ ] Resend domain verified, `CONTACT_FROM_EMAIL` is on that domain,
      and `CONTACT_TO_EMAIL` is monitored.
- [ ] giscus env vars populated and Discussions enabled on the repo.
- [ ] `/feed.xml`, `/sitemap.xml`, and `/robots.txt` look right when
      hit on the live URL.
- [ ] Replace the bio placeholder on the homepage sidebar and the
      `/about` page.
- [ ] Add a real favicon at `public/favicon.ico`.

## Known limitations

- The contact form has a honeypot and a minimum message length but no
  rate limiting. Add Upstash Ratelimit or Vercel's middleware
  rate-limit if abuse becomes a problem.
- `next/image` reads dimensions from PNG/JPEG headers at build time;
  exotic formats fall back to a 1200×675 placeholder size and may have
  slightly worse LCP. Convert to PNG or JPEG for best results.
