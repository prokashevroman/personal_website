import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

/*
 * Shared renderer for the file-convention `opengraph-image` routes. Uses
 * next/og's built-in font rather than fetching Fraunces/Inter so builds stay
 * hermetic (no network call during `next build`).
 *
 * Palette mirrors tailwind.config.ts: paper / ink / accent / rule.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const PAPER = "#FBFAF7";
const INK = "#1C1C20";
const INK_MUTED = "#5C5F66";
const ACCENT = "#2F6B57";
const RULE = "#E8E2D5";

type Options = {
  /** Small uppercase label above the headline, e.g. "Essay" or "About". */
  eyebrow: string;
  headline: string;
  /** Optional line under the headline — a date, reading time, or tagline. */
  meta?: string;
};

export function renderOgImage({ eyebrow, headline, meta }: Options): ImageResponse {
  // Long titles need to step down a size or they overflow the canvas.
  const headlineSize = headline.length > 90 ? 56 : headline.length > 55 ? 66 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "72px 80px",
          borderTop: `16px solid ${ACCENT}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: ACCENT,
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: headlineSize,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: INK,
              fontWeight: 700,
            }}
          >
            {headline}
          </div>
          {meta ? (
            <div style={{ marginTop: 28, fontSize: 28, color: INK_MUTED }}>{meta}</div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${RULE}`,
            paddingTop: 28,
            fontSize: 28,
            color: INK,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 700 }}>{siteConfig.name}</span>
            <span style={{ color: ACCENT, fontWeight: 700 }}>.</span>
          </div>
          <div style={{ color: INK_MUTED, fontSize: 24 }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
