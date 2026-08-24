import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

// Share card for the archive index. Needed as its own file because the page
// declares its own `openGraph`, which suppresses the root segment's image.
export const alt = "Last Click City — archive";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Archive · 2019–2024",
    headline: "Last Click City",
    meta: "Digital analytics, Google Analytics, BigQuery, attribution.",
  });
}
