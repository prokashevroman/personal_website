import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/*
 * The site wants to be read — by search engines and by AI agents alike. Rather
 * than relying on a bare `Allow: /`, the AI crawlers are named explicitly:
 * several of them (Google-Extended, Applebot-Extended) treat the absence of a
 * rule as ambiguous, and an explicit Allow removes the doubt.
 *
 * To opt out of AI training later, change a bot's `allow` to `disallow: "/"`.
 * Note the split roles: *-SearchBot / *-User crawlers power answer citations and
 * user-initiated fetches, while GPTBot / ClaudeBot / Google-Extended feed
 * training corpora. Blocking the latter need not mean losing the former.
 */
const AI_AGENTS = [
  // Answer engines and user-initiated fetches — these drive citations and referrals.
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "DuckAssistBot",
  "MistralAI-User",
  // Training crawlers.
  "GPTBot",
  "anthropic-ai",
  "cohere-ai",
  "meta-externalagent",
  "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // API routes are POST-only endpoints with nothing to index.
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: ["/api/"] })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
