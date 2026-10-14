import Link from "next/link";
import { localePath, t, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site-config";

export function Footer({ locale = "en" }: { locale?: Locale }) {
  const year = new Date().getFullYear();
  const dict = t[locale].footer;
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} {siteConfig.name}
        </p>
        <ul className="flex flex-wrap items-center gap-6">
          {/* The archive is indexable but reachable from nowhere else — without
              this link it is orphaned, and a page with no internal links in is
              one crawlers deprioritise regardless of the sitemap. Each locale
              links to its own mirror of it. */}
          <li>
            <Link href={localePath("/last-click-city", locale)} className="hover:text-ink">
              {dict.archiveLabel}
            </Link>
          </li>
          <li>
            <Link href={siteConfig.rssPath} className="hover:text-ink">
              {dict.rssLabel}
            </Link>
          </li>
          {siteConfig.social.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="hover:text-ink" target="_blank" rel="noreferrer me">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
