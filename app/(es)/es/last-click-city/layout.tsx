import type { Metadata } from "next";
import { ArchiveBanner } from "@/components/ArchiveBanner";
import { localeRobots } from "@/lib/seo";

// Spanish twin of app/(en)/last-click-city/layout.tsx. Same reasoning for putting
// `robots` here — the whole segment inherits it, and the not-found branch in
// [slug]/generateMetadata overrides it with `noindex` for unresolvable slugs —
// except the value comes from `localeRobots("es")`, so flipping the locale's
// LOCALE_INDEXABLE flag noindexes the Spanish archive along with the rest of /es.
export const metadata: Metadata = {
  robots: localeRobots("es"),
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ArchiveBanner locale="es" />
      {children}
    </div>
  );
}
