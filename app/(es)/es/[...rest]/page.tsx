import { notFound } from "next/navigation";

/*
 * Spanish twin of app/(en)/[...rest]/page.tsx. Without it, /es/unknown would
 * fall through to the English catch-all and show an English 404; this one
 * triggers the /es not-found.tsx inside the Spanish chrome instead. Static
 * segments beat catch-alls, so real /es routes are unaffected.
 */
export default function CatchAll(): never {
  notFound();
}
