"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LOCALES, LOCALE_NAMES, localePath, localesForPath, t, type Locale } from "@/lib/i18n";

/**
 * Language picker. Client component because the target URLs depend on the
 * current pathname: each option is this same page in another language, not a
 * link to that language's homepage.
 *
 * Built on `<details>` rather than React state so the options are real links in
 * the server-rendered HTML — crawlable, and working with no JavaScript at all.
 * The effect below only adds the two conveniences `<details>` lacks: closing on
 * an outside click and on Escape.
 *
 * The trigger names the language you are reading; the menu offers the others.
 * Options are filtered by `localesForPath`, so the archive — which has no Dutch
 * mirror — never offers Dutch and can't strand a reader on a 404. A post that
 * simply hasn't been translated yet still lands on that locale's localized 404
 * via the catch-all; that's the accepted limitation, since the switcher can't
 * read the filesystem.
 *
 * Navigation between locales is a full page load (multiple root layouts) —
 * expected Next behavior, don't add middleware for it.
 */
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() ?? "/";
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const close = () => {
      if (detailsRef.current) detailsRef.current.open = false;
    };
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !detailsRef.current?.open) return;
      close();
      summaryRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const enPath = localePath(pathname, "en");
  const available = localesForPath(enPath);
  const options = LOCALES.filter((item) => item !== locale && available.includes(item));
  const { ariaLabel } = t[locale].switcher;

  // Nothing to switch to — render the current language as plain text rather
  // than a dead control.
  if (options.length === 0) {
    return <span className="text-ink-muted">{LOCALE_NAMES[locale]}</span>;
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        ref={summaryRef}
        aria-label={ariaLabel}
        className="flex cursor-pointer list-none items-center gap-1 transition-colors hover:text-ink [&::-webkit-details-marker]:hidden"
      >
        {LOCALE_NAMES[locale]}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          className="shrink-0 stroke-current transition-transform group-open:rotate-180"
        >
          <path d="M2 4l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <ul className="absolute right-0 top-full z-50 mt-2 min-w-[8rem] rounded-lg border border-rule bg-paper py-1 shadow-lg">
        {options.map((item) => (
          <li key={item}>
            <Link
              href={localePath(enPath, item)}
              lang={item}
              hrefLang={item}
              className="block whitespace-nowrap px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-rule/40 hover:text-ink"
            >
              {LOCALE_NAMES[item]}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
