import { siteConfig } from "@/lib/site-config";

/*
 * i18n foundation for the /es mirror. Pure data + pure functions on purpose:
 * this module is imported by client components (forms, the language switcher),
 * so nothing here may touch fs or any server-only API.
 *
 * Spanish is neutral international Spanish — no vosotros, pan-Hispanic
 * vocabulary — because the audience is consulting prospects across markets.
 */

export type Locale = "en" | "es";

/**
 * The one switch for Spanish indexability. `true` emits self-canonicals,
 * bidirectional hreflang, and sitemap entries for /es. Flipping to `false`
 * noindexes every /es page (via `esRobots` in lib/seo.tsx), drops the hreflang
 * cluster on both sides, and removes /es from the sitemap — a complete,
 * consistent retreat in one line.
 */
export const ES_INDEXABLE = true;

export const ogLocale: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
};

/**
 * Maps a pathname to its counterpart in `locale`. Accepts paths from either
 * locale: `localePath("/blog/x", "es")` → "/es/blog/x", and
 * `localePath("/es/blog/x", "en")` → "/blog/x".
 */
export function localePath(pathname: string, locale: Locale): string {
  const bare =
    pathname === "/es"
      ? "/"
      : pathname.startsWith("/es/")
        ? pathname.slice("/es".length)
        : pathname;
  if (locale === "en") return bare;
  return bare === "/" ? "/es" : `/es${bare}`;
}

/*
 * Spanish titles for the archive's four categories. Only the one that isn't a
 * product name gets translated: "Google Analytics", "Google BigQuery", and
 * "Google Tag Manager" are the names Google itself uses in Spanish. Kept here
 * rather than in lib/last-click-city.data.ts, which is generated and must never
 * be hand-edited.
 */
const ES_CATEGORY_TITLES: Record<string, string> = {
  "attribution-models": "Modelos de atribución",
};

/**
 * Takes the category structurally (not as `ArchiveCategory`) so this module
 * stays free of any dependency on the archive pipeline. Unknown slugs fall back
 * to the English title, so a future category renders readably before it's
 * translated.
 */
export function archiveCategoryTitle(
  category: { slug: string; title: string },
  locale: Locale = "en",
): string {
  if (locale === "en") return category.title;
  return ES_CATEGORY_TITLES[category.slug] ?? category.title;
}

type NavItem = { href: string; label: string };

export type Dictionary = {
  siteDescription: string;
  skipToContent: string;
  nav: readonly NavItem[];
  switcher: {
    /** Link text, written in the *target* language ("Español" on English pages). */
    label: string;
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

/** Typed per-locale dictionary — TS enforces en/es key parity. */
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
      label: "Español",
      ariaLabel: "Leer esta página en español",
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
      label: "English",
      ariaLabel: "Read this page in English",
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
};
