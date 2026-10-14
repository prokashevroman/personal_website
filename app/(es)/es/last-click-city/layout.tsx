import type { Metadata } from "next";
import { ArchiveBanner } from "@/components/ArchiveBanner";
import { esRobots } from "@/lib/seo";

// Spanish twin of app/(en)/last-click-city/layout.tsx. Same reasoning for putting
// `robots` here — the whole segment inherits it, and the not-found branch in
// [slug]/generateMetadata overrides it with `noindex` for unresolvable slugs —
// except the value comes from `esRobots`, so flipping ES_INDEXABLE noindexes the
// Spanish archive along with the rest of the /es tree.
export const metadata: Metadata = {
  robots: esRobots,
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ArchiveBanner locale="es" />
      {children}
    </div>
  );
}
