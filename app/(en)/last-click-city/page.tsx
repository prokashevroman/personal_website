import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveCityHero } from "@/components/archive/ArchiveCityHero";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { getArchivePostsInPillarOrder, CATEGORIES } from "@/lib/last-click-city";
import {
  JsonLd,
  absoluteUrl,
  archiveBlogSchema,
  breadcrumbSchema,
  canonical,
  personSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const TITLE = "Last Click City (archive)";
// Written for search intent: the queries this content can win are about Google
// Analytics, BigQuery, and attribution, so those terms belong in the description.
const DESCRIPTION =
  "Archive of the Last Click City blog (2019–2024): 40 posts on digital analytics, Google Analytics, BigQuery SQL, and attribution modelling.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: canonical("/last-click-city"),
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl("/last-click-city"),
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ArchiveHome() {
  const posts = getArchivePostsInPillarOrder();
  return (
    <>
      <JsonLd
        schemas={[
          archiveBlogSchema(),
          personSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Last Click City", path: "/last-click-city" },
          ]),
        ]}
      />
      <ArchiveCityHero />

      <div className="mx-auto max-w-3xl">
        <div>
          {posts.map((post) => (
            <ArchiveCard key={post.frontmatter.slug} post={post} />
          ))}
        </div>

        <nav className="mt-16 border-t border-rule pt-8">
          <p className="eyebrow">Categories</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/last-click-city/${category.slug}`}
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
