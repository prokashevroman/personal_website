import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

// Same reason as the English twin: /es/last-click-city declares its own
// `openGraph`, which suppresses the parent segment's image.
export const alt = "Last Click City — archivo";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Archivo · 2019–2024",
    headline: "Last Click City",
    meta: "Analítica digital, Google Analytics, BigQuery, atribución.",
  });
}
