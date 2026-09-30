import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { localePath, t, type Locale } from "@/lib/i18n";

export function Header({ locale = "en" }: { locale?: Locale }) {
  const home = localePath("/", locale);
  return (
    <header>
      <div className="mx-auto flex max-w-5xl items-baseline justify-between gap-6 px-6 pt-8">
        <Link
          href={home}
          className="font-display text-lg font-semibold tracking-tightish text-ink hover:text-accent"
        >
          Roman Prokashev<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-baseline gap-8 text-sm text-ink-muted">
            {t[locale].nav
              .filter((item) => item.href !== home)
              .map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-ink">
                    {item.label}
                  </Link>
                </li>
              ))}
            <li>
              <LanguageSwitcher locale={locale} />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
