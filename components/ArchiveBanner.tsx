"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "lcc-banner-dismissed";

// Full-width sticky ribbon shown at the top of every /last-click-city/ page (via
// the segment layout). Green accent + white text to match the site; a dismiss
// button lets the reader hide it after the first screen. Client component because
// the hide/persist behavior needs the browser.
export function ArchiveBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (dismissed) return null;

  const hide = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      role="note"
      // Pull up to sit flush under the header (cancels <main>'s top padding).
      className="sticky top-0 z-40 -mt-14 mb-10 bg-accent text-white sm:-mt-20"
      // Full-bleed: break out of the centered <main> column to span the viewport.
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-2.5">
        <p className="flex-1 text-center text-sm leading-relaxed text-white">
          This is an archive of the Last Click City blog, which was published at
          lastclick.city from 2019 to 2024.
        </p>
        <button
          type="button"
          onClick={hide}
          aria-label="Hide this banner"
          className="-mr-1 shrink-0 rounded p-1 text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="stroke-current"
          >
            <path d="M4 4l8 8M12 4l-8 8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
