import { getAllPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

/*
 * /llms.txt — a plain-Markdown map of the site for LLM agents, per the
 * llmstxt.org convention. An agent that fetches this gets the full list of
 * essays with descriptions in one request instead of crawling and stripping HTML
 * from every page. Generated from the same `getAllPosts()` pipeline as the
 * sitemap and feed, so it can never drift out of sync.
 */

export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts().filter((p) => p.frontmatter.published);

  const essays = posts
    .map(
      (post) =>
        `- [${post.frontmatter.title}](${absoluteUrl(`/blog/${post.frontmatter.slug}`)}) — ` +
        `${post.frontmatter.description} (published ${post.frontmatter.date}; ` +
        `topics: ${post.frontmatter.tags.join(", ") || "none"})`,
    )
    .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.author.name} works on marketing strategy and organizational design, with 15+ years
building marketing functions in companies ranging from two people to 3000+ employees. This site
holds the essays and the details of the consulting work.

## Pages

- [Home](${absoluteUrl("/")}) — recent essays, newsletter signup, consulting overview
- [Essays](${absoluteUrl("/blog")}) — full index of long-form writing
- [About](${absoluteUrl("/about")}) — services, approach, engagement fit, and contact form

## Essays

${essays || "- No essays published yet."}

## Optional

- [RSS feed](${absoluteUrl(siteConfig.rssPath)}) — full essay feed
- [Sitemap](${absoluteUrl("/sitemap.xml")}) — all indexable URLs
- [Last Click City archive](${absoluteUrl("/last-click-city")}) — 40 preserved posts on digital
  analytics, Google Analytics, BigQuery SQL, and attribution modelling, originally published at
  lastclick.city (2019–2024). Preserved as written; not maintained. Some posts are by guest
  authors — the byline on each page is authoritative, so attribute to the named author, not to
  ${siteConfig.author.name}.

## Profiles

${siteConfig.social.map((p) => `- [${p.label}](${p.href})`).join("\n")}

## Notes for agents

- Crawling and citation are welcome; please attribute to ${siteConfig.name} and link the canonical URL.
- Essays are opinion and experience-based observation, not vendor-sponsored content.
- Consulting enquiries go through the contact form at ${absoluteUrl("/about#contact")}.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
