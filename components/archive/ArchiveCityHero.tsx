// Pillar hero recreating the old lastclick.city header: a full-width light-gray
// band with the black-and-white skyline (transparent-top PNG) anchored at the
// bottom, and the title/subtitle centered above it. Used only on the archive
// pillar page; category pages keep the plain ArchiveHero.
export function ArchiveCityHero() {
  return (
    <div
      className="mb-14 flex flex-col items-center bg-[#ececec] px-6 pb-[28%] pt-16 text-center sm:pt-24"
      style={{
        // Full-bleed out of the centered <main> column to span the viewport.
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        backgroundImage: "url(/images/last-click-city/city-1879x701v3.png)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center bottom",
        backgroundSize: "100% auto",
      }}
    >
      <h1 className="font-sans text-4xl font-extrabold uppercase tracking-tight text-ink sm:text-6xl">
        Last Click City
      </h1>
      <p className="mt-3 text-lg font-normal text-ink-muted sm:text-2xl">
        Digital analytics blog
      </p>
    </div>
  );
}
