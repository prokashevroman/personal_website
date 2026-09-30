import { Fraunces, Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { t, type Locale } from "@/lib/i18n";
import "@/app/globals.css";

/*
 * Shared body of the two root layouts (app/(en)/layout.tsx and
 * app/(es)/layout.tsx). Extracted so the layouts can't drift: fonts are
 * instantiated once here, globals.css is imported once here, and both locales
 * render the identical shell — only `lang` and the chrome strings differ.
 */

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});

export function RootShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-paper focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          {t[locale].skipToContent}
        </a>
        <Header locale={locale} />
        <main id="main" className="mx-auto max-w-5xl px-6 pb-24 pt-8 sm:pt-12">
          {children}
        </main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
