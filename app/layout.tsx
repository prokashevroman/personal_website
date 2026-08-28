import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});

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
  // redundant (indexable is the default) and harmful: app/not-found.tsx can't
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
  // own canonical via `canonical()` in lib/seo.tsx.
  alternates: {
    types: {
      "application/rss+xml": [{ url: siteConfig.rssPath, title: `${siteConfig.name} RSS` }],
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-paper focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="mx-auto max-w-5xl px-6 pb-24 pt-8 sm:pt-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
