// Page header for the archive pillar and category pages — styled like the site's
// other section headers (eyebrow + display title + muted subtitle).
type Props = { eyebrow: string; title: string; subtitle?: string };

export function ArchiveHero({ eyebrow, title, subtitle }: Props) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink sm:text-5xl">
        {title}
      </h1>
      {subtitle ? <p className="mt-3 text-lg text-ink-muted">{subtitle}</p> : null}
    </header>
  );
}
