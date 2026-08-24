import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { siteConfig } from "@/lib/site-config";

// Needed for the same reason as app/blog/opengraph-image.tsx: /about declares
// its own `openGraph`, which suppresses the root segment's image.
export const alt = `About ${siteConfig.author.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Consulting",
    headline: "Marketing functions that create measurable growth.",
    meta: "Strategy, operating model, demand generation, measurement.",
  });
}
