import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="eyebrow text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink">
        Page not found
      </h1>
      <p className="mt-4 text-ink-muted">
        The page you were looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center text-sm font-medium text-accent hover:text-accent-hover"
      >
        ← Back home
      </Link>
    </div>
  );
}
