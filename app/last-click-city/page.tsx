import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveHero } from "@/components/archive/ArchiveHero";
import { ArchiveCard } from "@/components/archive/ArchiveCard";
import { getArchivePostsInPillarOrder, CATEGORIES } from "@/lib/last-click-city";

export const metadata: Metadata = {
  title: "Last Click City (archive)",
  description: "Archive of the Last Click City digital analytics blog (2019–2024).",
};

export default function ArchiveHome() {
  const posts = getArchivePostsInPillarOrder();
  return (
    <div className="mx-auto max-w-3xl">
      <ArchiveHero eyebrow="Archive" title="Last Click City" subtitle="Digital analytics blog, 2019–2024." />

      <div className="mt-14">
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
  );
}
