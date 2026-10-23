import type { Metadata } from "next";
import { RootShell } from "@/components/RootShell";
import { ogLocale, t } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

/*
 * Spanish root layout — the /es twin of app/(en)/layout.tsx. Metadata is
 * re-declared IN FULL: Next merges metadata shallowly per segment and the two
 * root layouts are siblings, so nothing is inherited from the English side.
 * Leaving a field out here means shipping without it, not falling back.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.shortName}`,
  },
  description: t.es.siteDescription,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  // No `robots` here, same reasoning as the English layout: pages opt in via
  // `localeRobots("es")` from lib/seo.tsx (which is also where the indexability
  // lands), and the 404 keeps Next's automatic noindex uncontradicted.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: ogLocale.es,
    url: absoluteUrl("/es"),
    title: siteConfig.name,
    description: t.es.siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: t.es.siteDescription,
  },
  // No `alternates.canonical` — every /es page sets its own via
  // `localizedAlternates()`. The RSS type is repeated per page for the same
  // shallow-merge reason.
  alternates: {
    types: {
      "application/rss+xml": [{ url: siteConfig.rssPath, title: `${siteConfig.name} RSS` }],
    },
  },
};

export default function SpanishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="es">{children}</RootShell>;
}
