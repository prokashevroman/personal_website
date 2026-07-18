// Reusable ribbon shown once at the top of every /last-click-city/ page (via the
// segment layout). Marks the section as a preserved archive of the old blog.
export function ArchiveBanner() {
  return (
    <div
      role="note"
      className="mb-12 rounded-lg border border-rule bg-accent-soft/60 px-4 py-3 text-center text-sm leading-relaxed text-ink-muted"
    >
      This is an archive of the Last Click City blog, which was published at
      lastclick.city from 2019 to 2024.
    </div>
  );
}
