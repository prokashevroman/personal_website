import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { siteConfig } from "@/lib/site-config";

// Site-wide fallback share card. Next applies this to every route under `app/`
// that doesn't define its own opengraph-image, so /blog, /about, and the archive
// inherit it. Blog posts override it with a per-title card.
export const alt = `${siteConfig.name} — ${siteConfig.description}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Marketing strategy & organizational design",
    headline: "Observations on marketing, leadership, and technology.",
    meta: "15+ years building marketing functions, from 2 to 3000+ people.",
  });
}
