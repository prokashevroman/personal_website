import type { Metadata } from "next";
import { RootShell } from "@/components/RootShell";
import { ogLocale, t } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

/*
 * Dutch root layout — the /nl twin of app/(en)/layout.tsx. Metadata is
 * re-declared IN FULL: Next merges metadata shallowly per segment and the root
 * layouts are siblings, so nothing is inherited from the English or Spanish
 * side. Leaving a field out here means shipping without it, not falling back.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.shortName}`,
  },
  description: t.nl.siteDescription,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  // No `robots` here, same reasoning as the other layouts: pages opt in via
  // `localeRobots("nl")` from lib/seo.tsx (which is also where the indexability
  // flag lands), and the 404 keeps Next's automatic noindex uncontradicted.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: ogLocale.nl,
    url: absoluteUrl("/nl"),
    title: siteConfig.name,
    description: t.nl.siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: t.nl.siteDescription,
  },
  // No `alternates.canonical` — every /nl page sets its own via
  // `localizedAlternates()`. The RSS type is repeated per page for the same
  // shallow-merge reason.
  alternates: {
    types: {
      "application/rss+xml": [{ url: siteConfig.rssPath, title: `${siteConfig.name} RSS` }],
    },
  },
};

export default function DutchRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="nl">{children}</RootShell>;
}
