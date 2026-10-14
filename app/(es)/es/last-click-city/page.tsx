import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveCityHero } from "@/components/archive/ArchiveCityHero";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { archiveCategoryTitle, ogLocale } from "@/lib/i18n";
import { getArchivePostsInPillarOrder, CATEGORIES } from "@/lib/last-click-city";
import {
  JsonLd,
  absoluteUrl,
  archiveBlogSchema,
  breadcrumbSchema,
  esRobots,
  localizedAlternates,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const TITLE = "Last Click City (archivo)";
// Same search intent as the English twin: the queries this content can win are
// about Google Analytics, BigQuery, and attribution, so those terms belong here.
const DESCRIPTION =
  "Archivo del blog Last Click City (2019-2024): 40 artículos sobre analítica digital, Google Analytics, SQL en BigQuery y modelos de atribución.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Unconditional, unlike the per-post pages: the index exists in both locales
  // regardless of how many articles are translated.
  alternates: localizedAlternates("/last-click-city", "es"),
  robots: esRobots,
  // Set explicitly and in full: a page-level `openGraph` replaces the Spanish
  // layout's instead of merging with it.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: ogLocale.es,
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/es/last-click-city"),
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ArchiveHome() {
  // Untranslated slugs simply aren't in content/last-click-city/es/ yet, so they
  // drop out of this listing — the index is correct at every stage.
  const posts = getArchivePostsInPillarOrder("es");
  return (
    <>
      <JsonLd
        schemas={[
          archiveBlogSchema("es"),
          personSchema(),
          breadcrumbSchema([
            { name: "Inicio", path: "/es" },
            { name: "Last Click City", path: "/es/last-click-city" },
          ]),
        ]}
      />
      <ArchiveCityHero locale="es" />

      <div className="mx-auto max-w-3xl">
        <div>
          {posts.map((post) => (
            <ArchiveCard key={post.frontmatter.slug} post={post} locale="es" />
          ))}
        </div>

        <nav className="mt-16 border-t border-rule pt-8">
          <p className="eyebrow">Categorías</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/es/last-click-city/${category.slug}`}
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  {archiveCategoryTitle(category, "es")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
