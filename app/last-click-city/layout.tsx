import type { Metadata } from "next";
import { ArchiveBanner } from "@/components/ArchiveBanner";

// Keep the whole archive out of search indexes for now (reversible: delete this
// export to let the segment be indexed).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
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
