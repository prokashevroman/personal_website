/**
 * The Claude logomark — a ten-ray asterisk in Claude's orange. Inline SVG rather
 * than a file in public/ to match the rest of the repo (public/ holds images;
 * every icon, like ArchiveBanner's close button, is inline).
 *
 * Decorative: it sits next to the "translated with Claude" note, which already
 * names Claude in text, so it carries no information of its own and is hidden
 * from assistive tech.
 */
export function ClaudeMark({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="#D97757" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8 1.8V14.2" />
        <path d="M11.64 2.99 4.36 13.01" />
        <path d="M13.9 6.08 2.1 9.92" />
        <path d="M13.9 9.92 2.1 6.08" />
        <path d="M11.64 13.01 4.36 2.99" />
      </g>
    </svg>
  );
}
