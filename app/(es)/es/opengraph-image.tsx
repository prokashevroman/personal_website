import { t } from "@/lib/i18n";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { siteConfig } from "@/lib/site-config";

// Spanish fallback share card for the /es segment. The site-wide fallback at
// app/opengraph-image.tsx is English, so /es needs its own or Spanish shares
// would carry English copy.
export const alt = `${siteConfig.name} — ${t.es.siteDescription}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Estrategia de marketing y diseño organizativo",
    headline: "Observaciones sobre marketing, liderazgo y tecnología.",
    meta: "Más de 15 años construyendo funciones de marketing, de 2 a más de 3000 personas.",
  });
}
