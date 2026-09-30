import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { siteConfig } from "@/lib/site-config";

// Same reason as the English twin: /es/about declares its own `openGraph`,
// which suppresses the parent segment's image.
export const alt = `Sobre ${siteConfig.author.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Consultoría",
    headline: "Funciones de marketing que generan crecimiento medible.",
    meta: "Estrategia, modelo operativo, generación de demanda, medición.",
  });
}
