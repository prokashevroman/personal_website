import { notFound } from "next/navigation";

/*
 * Global-404 replacement. With two root layouts there can be no app/
 * not-found.tsx — Next 15.5 would render it inside a built-in bare
 * <html><body> with no lang, no CSS, and no fonts. Instead this catch-all
 * matches any URL no other route claims and triggers the (en) group's
 * not-found.tsx, which renders with full English chrome. Static segments
 * always beat catch-alls, so /es/*, /feed.xml, /api/* etc. are unaffected.
 * The route is dynamic (ƒ) — fine on the current server deployment; revisit
 * if hosting ever moves to static export.
 */
export default function CatchAll(): never {
  notFound();
}
