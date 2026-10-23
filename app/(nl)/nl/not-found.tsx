import Link from "next/link";
import { t } from "@/lib/i18n";

export default function NotFound() {
  const dict = t.nl.notFound;
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="eyebrow text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink">
        {dict.title}
      </h1>
      <p className="mt-4 text-ink-muted">{dict.body}</p>
      <Link
        href="/nl"
        className="mt-8 inline-flex items-center text-sm font-medium text-accent hover:text-accent-hover"
      >
        {dict.backHome}
      </Link>
    </div>
  );
}
