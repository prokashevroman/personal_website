import { siteConfig } from "@/lib/site-config";

/*
 * i18n foundation for the /es and /nl mirrors. Pure data + pure functions on
 * purpose: this module is imported by client components (forms, the language
 * switcher), so nothing here may touch fs or any server-only API.
 *
 * Spanish is neutral international Spanish — no vosotros, pan-Hispanic
 * vocabulary — because the audience is consulting prospects across markets.
 * Dutch uses "je" rather than "u": the English voice is personal and direct,
 * and "u" would read as a different person writing.
 */

/** English first — it is the source language and the x-default target. */
export const LOCALES = ["en", "es", "nl"] as const;

export type Locale = (typeof LOCALES)[number];

/** Mirror locales: every locale that lives under a URL prefix. */
export const MIRROR_LOCALES = LOCALES.filter((locale) => locale !== "en");

/** URL prefix per locale. English is unprefixed and has none. */
const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  es: "/es",
  nl: "/nl",
};

/**
 * Endonyms — each language's name for itself, which is what a language picker
 * should show: a reader looking for Dutch recognises "Nederlands", not "Dutch".
 * Identical in every locale, so there is one copy rather than one per dictionary.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  nl: "Nederlands",
};

/**
 * Per-locale indexability — the one switch per mirror. Flipping a locale to
 * `false` noindexes every page of it (via `localeRobots` in lib/seo.tsx), drops
 * it from the hreflang cluster on every side (via `localizedAlternates`), and
 * removes it from the sitemap: a complete, consistent retreat in one line.
 * English is never flipped — it is the canonical tree.
 */
export const LOCALE_INDEXABLE: Record<Locale, boolean> = {
  en: true,
  es: true,
  nl: true,
};

export const ogLocale: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  nl: "nl_NL",
};

/**
 * The locales the Last Click City archive is mirrored in. The live site is
 * translated in full; the archive is 40 posts of preserved writing and is
 * translated separately, so it lags behind. Anything that builds a hreflang
 * cluster or a language picker has to respect this — pointing Dutch readers at
 * an archive URL that doesn't exist would be a dangling link in every locale.
 */
export const ARCHIVE_LOCALES: readonly Locale[] = ["en", "es"];

/** `true` for `/last-click-city` and everything under it. */
export function isArchivePath(enPath: string): boolean {
  return enPath === "/last-click-city" || enPath.startsWith("/last-click-city/");
}

/**
 * Which locales a given English path is mirrored in, by route — the structural
 * answer. Per-page content (a post translated into some locales but not others)
 * is a separate question the page itself has to answer from disk.
 */
export function localesForPath(enPath: string): readonly Locale[] {
  return isArchivePath(enPath) ? ARCHIVE_LOCALES : LOCALES;
}

/** Strips any known locale prefix, yielding the English (unprefixed) path. */
function stripLocale(pathname: string): string {
  for (const locale of MIRROR_LOCALES) {
    const prefix = LOCALE_PREFIX[locale];
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

/**
 * Maps a pathname to its counterpart in `locale`. Accepts paths from any
 * locale: `localePath("/blog/x", "nl")` → "/nl/blog/x", and
 * `localePath("/es/blog/x", "en")` → "/blog/x".
 */
export function localePath(pathname: string, locale: Locale): string {
  const bare = stripLocale(pathname);
  const prefix = LOCALE_PREFIX[locale];
  if (!prefix) return bare;
  return bare === "/" ? prefix : `${prefix}${bare}`;
}

/*
 * Translated titles for the archive's four categories. Only the one that isn't
 * a product name gets translated: "Google Analytics", "Google BigQuery", and
 * "Google Tag Manager" are the names Google itself uses in every language.
 * Kept here rather than in lib/last-click-city.data.ts, which is generated and
 * must never be hand-edited.
 */
const CATEGORY_TITLES: Partial<Record<Locale, Record<string, string>>> = {
  es: { "attribution-models": "Modelos de atribución" },
};

/**
 * Takes the category structurally (not as `ArchiveCategory`) so this module
 * stays free of any dependency on the archive pipeline. Unknown slugs and
 * untranslated locales fall back to the English title, so a category renders
 * readably before it's translated.
 */
export function archiveCategoryTitle(
  category: { slug: string; title: string },
  locale: Locale = "en",
): string {
  return CATEGORY_TITLES[locale]?.[category.slug] ?? category.title;
}

type NavItem = { href: string; label: string };

export type Dictionary = {
  siteDescription: string;
  skipToContent: string;
  nav: readonly NavItem[];
  switcher: {
    /**
     * Accessible name of the picker's trigger, in the page's own language. The
     * options themselves are endonyms from `LOCALE_NAMES`, so they need no
     * per-locale copy.
     */
    ariaLabel: string;
  };
  footer: {
    archiveLabel: string;
    rssLabel: string;
  };
  card: {
    /** Follows the reading-minutes number: "7 min read" / "7 min de lectura". */
    minRead: string;
    draft: string;
  };
  article: {
    minRead: string;
    aiDisclaimer: string;
    /**
     * Translation disclosure, rendered next to the Claude mark. `null` in the
     * locale the post was written in — English pages say nothing.
     */
    translatedNote: string | null;
  };
  /** Strings rendered by the shared Last Click City archive components. */
  archive: {
    bannerBody: string;
    bannerDismiss: string;
    cityHeroTagline: string;
    continueReading: string;
    /** Precedes the guest author's name: "By Sergey Matrosov" / "Por …". */
    by: string;
    backToArchive: string;
  };
  comments: {
    heading: string;
    unavailable: string;
  };
  subscribe: {
    emailLabel: string;
    placeholder: string;
    submit: string;
    submitting: string;
    success: string;
    genericError: string;
    networkError: string;
  };
  contact: {
    nameLabel: string;
    emailLabel: string;
    companyLabel: string;
    messageLabel: string;
    messageHint: string;
    submit: string;
    submitting: string;
    success: string;
    genericError: string;
    networkError: string;
  };
  notFound: {
    title: string;
    body: string;
    backHome: string;
  };
};

/** Typed per-locale dictionary — TS enforces key parity across all locales. */
export const t: Record<Locale, Dictionary> = {
  en: {
    siteDescription: siteConfig.description,
    skipToContent: "Skip to content",
    nav: [
      { href: "/", label: "Home" },
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "About" },
    ],
    switcher: {
      ariaLabel: "Change language",
    },
    footer: {
      archiveLabel: "Last Click City archive",
      rssLabel: "RSS",
    },
    card: {
      minRead: "min read",
      draft: "Draft",
    },
    article: {
      minRead: "min read",
      aiDisclaimer:
        "AI helps polish the writing. The thinking, observations, and opinions are my own — drawn from working inside marketing teams.",
      translatedNote: null,
    },
    archive: {
      bannerBody:
        "This is an archive of the Last Click City blog, which was published at lastclick.city from 2019 to 2024.",
      bannerDismiss: "Hide this banner",
      cityHeroTagline: "Digital analytics blog",
      continueReading: "Continue reading",
      by: "By",
      backToArchive: "← Back to Last Click City",
    },
    comments: {
      heading: "Comments",
      unavailable: "Comments will be available soon.",
    },
    subscribe: {
      emailLabel: "Email address",
      placeholder: "you@example.com",
      submit: "Subscribe",
      submitting: "Subscribing…",
      success: "Thanks — check your inbox to confirm.",
      genericError: "Something went wrong. Please try again.",
      networkError: "Network error. Please try again.",
    },
    contact: {
      nameLabel: "Name",
      emailLabel: "Email",
      companyLabel: "Company (optional)",
      messageLabel: "Message",
      messageHint: "A short paragraph is enough — 20+ characters.",
      submit: "Send message",
      submitting: "Sending…",
      success: "Thanks — your message is on its way. I'll reply soon.",
      genericError: "Something went wrong. Please try again.",
      networkError: "Network error. Please try again.",
    },
    notFound: {
      title: "Page not found",
      body: "The page you were looking for doesn't exist.",
      backHome: "← Back home",
    },
  },
  es: {
    siteDescription:
      "Estrategia de marketing y observaciones sobre organizaciones, tras más de 15 años dentro de equipos de marketing de todos los tamaños.",
    skipToContent: "Saltar al contenido",
    nav: [
      { href: "/es", label: "Inicio" },
      { href: "/es/blog", label: "Blog" },
      { href: "/es/about", label: "Sobre mí" },
    ],
    switcher: {
      ariaLabel: "Cambiar de idioma",
    },
    footer: {
      archiveLabel: "Archivo de Last Click City",
      rssLabel: "RSS",
    },
    card: {
      minRead: "min de lectura",
      draft: "Borrador",
    },
    article: {
      minRead: "min de lectura",
      aiDisclaimer:
        "La IA me ayuda a pulir la redacción. Las ideas, las observaciones y las opiniones son mías, y nacen de mi trabajo dentro de equipos de marketing.",
      translatedNote: "Traducido del inglés con Claude.",
    },
    archive: {
      bannerBody:
        "Este es un archivo del blog Last Click City, publicado en lastclick.city entre 2019 y 2024.",
      bannerDismiss: "Ocultar este aviso",
      cityHeroTagline: "Blog de analítica digital",
      continueReading: "Seguir leyendo",
      by: "Por",
      backToArchive: "← Volver a Last Click City",
    },
    comments: {
      heading: "Comentarios",
      unavailable: "Los comentarios estarán disponibles pronto.",
    },
    subscribe: {
      emailLabel: "Dirección de correo electrónico",
      placeholder: "tu@ejemplo.com",
      submit: "Suscribirme",
      submitting: "Suscribiendo…",
      success: "Gracias. Revisa tu bandeja de entrada para confirmar la suscripción.",
      genericError: "Algo salió mal. Inténtalo de nuevo.",
      networkError: "Error de red. Inténtalo de nuevo.",
    },
    contact: {
      nameLabel: "Nombre",
      emailLabel: "Correo electrónico",
      companyLabel: "Empresa (opcional)",
      messageLabel: "Mensaje",
      messageHint: "Con un párrafo corto es suficiente: 20 caracteres o más.",
      submit: "Enviar mensaje",
      submitting: "Enviando…",
      success: "Gracias, tu mensaje está en camino. Te responderé pronto.",
      genericError: "Algo salió mal. Inténtalo de nuevo.",
      networkError: "Error de red. Inténtalo de nuevo.",
    },
    notFound: {
      title: "Página no encontrada",
      body: "La página que buscas no existe.",
      backHome: "← Volver al inicio",
    },
  },
  nl: {
    siteDescription:
      "Marketingstrategie en observaties over organisaties, na ruim 15 jaar binnen marketingteams van elke omvang.",
    skipToContent: "Naar de inhoud",
    nav: [
      { href: "/nl", label: "Home" },
      { href: "/nl/blog", label: "Blog" },
      { href: "/nl/about", label: "Over mij" },
    ],
    switcher: {
      ariaLabel: "Taal wijzigen",
    },
    footer: {
      archiveLabel: "Last Click City-archief",
      rssLabel: "RSS",
    },
    card: {
      minRead: "min leestijd",
      draft: "Concept",
    },
    article: {
      minRead: "min leestijd",
      aiDisclaimer:
        "AI helpt me de tekst te polijsten. Het denkwerk, de observaties en de meningen zijn van mij, en komen voort uit mijn werk binnen marketingteams.",
      translatedNote: "Vertaald uit het Engels met Claude.",
    },
    // The archive has no Dutch mirror yet (see ARCHIVE_LOCALES). These strings
    // exist because the dictionary type demands parity, and they mean the shared
    // archive components are ready the day it is translated.
    archive: {
      bannerBody:
        "Dit is een archief van de blog Last Click City, die van 2019 tot 2024 verscheen op lastclick.city.",
      bannerDismiss: "Deze melding verbergen",
      cityHeroTagline: "Blog over digitale analytics",
      continueReading: "Verder lezen",
      by: "Door",
      backToArchive: "← Terug naar Last Click City",
    },
    comments: {
      heading: "Reacties",
      unavailable: "Reacties zijn binnenkort beschikbaar.",
    },
    subscribe: {
      emailLabel: "E-mailadres",
      placeholder: "jij@voorbeeld.nl",
      submit: "Aanmelden",
      submitting: "Bezig met aanmelden…",
      success: "Bedankt. Check je inbox om je aanmelding te bevestigen.",
      genericError: "Er ging iets mis. Probeer het opnieuw.",
      networkError: "Netwerkfout. Probeer het opnieuw.",
    },
    contact: {
      nameLabel: "Naam",
      emailLabel: "E-mail",
      companyLabel: "Bedrijf (optioneel)",
      messageLabel: "Bericht",
      messageHint: "Een korte alinea is genoeg: minimaal 20 tekens.",
      submit: "Bericht versturen",
      submitting: "Versturen…",
      success: "Bedankt, je bericht is onderweg. Ik reageer snel.",
      genericError: "Er ging iets mis. Probeer het opnieuw.",
      networkError: "Netwerkfout. Probeer het opnieuw.",
    },
    notFound: {
      title: "Pagina niet gevonden",
      body: "De pagina die je zocht bestaat niet.",
      backHome: "← Terug naar home",
    },
  },
};
