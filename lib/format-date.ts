import type { Locale } from "@/lib/i18n";

const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
};

/**
 * Shared date formatter for post cards, article headers, and OG images —
 * live posts and the Last Click City archive alike.
 * Always UTC: frontmatter dates are plain YYYY-MM-DD, and a local timezone
 * would shift them by a day for readers west of Greenwich.
 */
export function formatDate(
  iso: string,
  locale: Locale = "en",
  month: "short" | "long" = "long",
): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(DATE_LOCALES[locale], {
    year: "numeric",
    month,
    day: "numeric",
    timeZone: "UTC",
  });
}
