// `url` feeds every canonical, og:url, sitemap entry, and JSON-LD @id on the
// site, so a missing NEXT_PUBLIC_SITE_URL in a production build would publish
// example.com URLs to Google. Fail the build instead.
function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required for production builds — canonicals, the sitemap, and JSON-LD all derive from it.",
    );
  }
  return "http://localhost:3000";
}

/*
 * Profile links. One list, two consumers: the footer renders them (with
 * `rel="me"`, which is what makes them a bidirectional identity claim rather than
 * a plain outbound link), and the Person schema's `sameAs` derives from them.
 * Deriving rather than duplicating means the two can't drift apart.
 */
const SOCIAL_PROFILES = [
  { href: "https://www.linkedin.com/in/roman-prokashev/", label: "LinkedIn" },
  { href: "https://github.com/prokashevroman", label: "GitHub" },
] as const;

export const siteConfig = {
  name: "Roman Prokashev",
  shortName: "Roman Prokashev",
  description:
    "Marketing strategy and organizational observations from 15+ years inside marketing teams of every size.",
  url: resolveSiteUrl(),
  locale: "en_US",
  language: "en",
  author: {
    name: "Roman Prokashev",
    email: "",
    jobTitle: "Marketing strategy and organizational design consultant",
    // `sameAs` in the Person schema — the strongest signal Google and AI agents
    // have for tying this site to a real, verifiable identity. Derived from
    // SOCIAL_PROFILES so it can never fall out of sync with the footer.
    sameAs: SOCIAL_PROFILES.map((profile) => profile.href) as string[],
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ],
  social: SOCIAL_PROFILES as readonly { href: string; label: string }[],
  rssPath: "/feed.xml",
  contactAnchor: "/about#contact",
} as const;

export type SiteConfig = typeof siteConfig;
