export const siteConfig = {
  name: "Roman Prokashev",
  shortName: "Roman Prokashev",
  description:
    "Marketing strategy and organizational observations from 15+ years inside marketing teams of every size.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  author: {
    name: "Roman Prokashev",
    email: "",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ],
  social: [
    // { href: "https://www.linkedin.com/in/...", label: "LinkedIn" },
    // { href: "https://x.com/...", label: "X" },
  ] as { href: string; label: string }[],
  rssPath: "/feed.xml",
  contactAnchor: "/about#contact",
} as const;

export type SiteConfig = typeof siteConfig;
