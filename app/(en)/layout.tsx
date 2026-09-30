import type { Metadata } from "next";
import { RootShell } from "@/components/RootShell";
import { siteConfig } from "@/lib/site-config";

/*
 * English root layout. One of two root layouts — app/(es)/layout.tsx is the
 * Spanish twin. There is deliberately NO app/layout.tsx: with route groups,
 * each group owns its <html> element (that is what lets /es declare
 * lang="es"), and a shared root layout would force one lang on both. The
 * shared body lives in components/RootShell.tsx so the two can't drift.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  // NOTE: no `robots` here either. A root-level `index, follow` is both
  // redundant (indexable is the default) and harmful: the not-found page can't
  // export metadata to override it, so the 404 shipped Next's automatic
  // `noindex` and an inherited `index, follow` side by side. Indexable pages opt
  // in via `indexable` from lib/seo.tsx instead.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  // NOTE: intentionally no `alternates.canonical` here. Child pages inherit it
  // verbatim, which would point every route at the homepage. Each page sets its
  // own canonical via `canonical()` / `localizedAlternates()` in lib/seo.tsx.
  alternates: {
    types: {
      "application/rss+xml": [{ url: siteConfig.rssPath, title: `${siteConfig.name} RSS` }],
    },
  },
};

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="en">{children}</RootShell>;
}
