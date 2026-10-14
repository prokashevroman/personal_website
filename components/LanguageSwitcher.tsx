"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath, t, type Locale } from "@/lib/i18n";

/**
 * Client component because the target URL depends on the current pathname.
 * en → es maps to the mirrored /es path; es → en strips the /es prefix. An
 * English page whose twin isn't written yet (an untranslated archive article)
 * lands on the localized /es 404 via the catch-all — accepted, and the same
 * behavior the blog has always had. Navigation across the two root layouts is a
 * full page load — expected Next behavior with multiple root layouts.
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "/";
  const target = localePath(pathname, locale === "en" ? "es" : "en");
  const targetLocale: Locale = locale === "en" ? "es" : "en";
  const { label, ariaLabel } = t[locale].switcher;

  return (
    <Link
      href={target}
      lang={targetLocale}
      hrefLang={targetLocale}
      aria-label={ariaLabel}
      className="transition-colors hover:text-ink"
    >
      {label}
    </Link>
  );
}
