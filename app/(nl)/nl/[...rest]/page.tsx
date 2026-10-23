import { notFound } from "next/navigation";

/*
 * Dutch twin of app/(en)/[...rest]/page.tsx. Without it, /nl/unknown would fall
 * through to the English catch-all and show an English 404; this one triggers
 * the /nl not-found.tsx inside the Dutch chrome instead. Static segments beat
 * catch-alls, so real /nl routes are unaffected.
 *
 * It also catches /nl/last-click-city/*: the archive has no Dutch mirror yet, so
 * those URLs land on the localized Dutch 404 rather than nothing at all.
 */
export default function CatchAll(): never {
  notFound();
}
