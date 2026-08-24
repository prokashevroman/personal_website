import type { Metadata } from "next";
import { ArchiveBanner } from "@/components/ArchiveBanner";
import { indexable } from "@/lib/seo";

// The archive is indexed. It is 40 posts of original analytics writing and, since
// lastclick.city lapsed and was re-registered by an unrelated site, this is now
// the only place the content exists.
//
// Applied at the layout so the whole segment inherits it; the not-found branch in
// [slug]/generateMetadata overrides it with `noindex` for unresolvable slugs.
export const metadata: Metadata = {
  robots: indexable,
};

// The archive reuses the site's design system (fonts, colors, prose) so it reads
// as a polished part of the site; the banner marks it as a preserved archive.
export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ArchiveBanner />
      {children}
    </div>
  );
}
