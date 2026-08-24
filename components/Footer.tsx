import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} {siteConfig.name}
        </p>
        <ul className="flex flex-wrap items-center gap-6">
          {/* The archive is indexable but reachable from nowhere else — without
              this link it is orphaned, and a page with no internal links in is
              one crawlers deprioritise regardless of the sitemap. */}
          <li>
            <Link href="/last-click-city" className="hover:text-ink">
              Last Click City archive
            </Link>
          </li>
          <li>
            <Link href={siteConfig.rssPath} className="hover:text-ink">
              RSS
            </Link>
          </li>
          {siteConfig.social.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="hover:text-ink"
                target="_blank"
                rel="noreferrer me"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
