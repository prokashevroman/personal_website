import { t } from "@/lib/i18n";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { siteConfig } from "@/lib/site-config";

// Dutch fallback share card for the /nl segment. The site-wide fallback at
// app/opengraph-image.tsx is English, so /nl needs its own or Dutch shares
// would carry English copy.
export const alt = `${siteConfig.name} — ${t.nl.siteDescription}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Marketingstrategie en organisatieontwerp",
    headline: "Observaties over marketing, leiderschap en technologie.",
    meta: "Ruim 15 jaar marketingfuncties bouwen, van 2 tot 3000+ mensen.",
  });
}
