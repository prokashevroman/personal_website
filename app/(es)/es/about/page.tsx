import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { ogLocale } from "@/lib/i18n";
import {
  JsonLd,
  absoluteUrl,
  breadcrumbSchema,
  esRobots,
  localizedAlternates,
  personSchema,
  profilePageSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const TITLE = "Sobre mí";
const DESCRIPTION =
  "Roman Prokashev construye funciones de marketing que generan ingresos para empresas técnicas: estrategia de crecimiento, modelos operativos, generación de demanda y medición.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: localizedAlternates("/about", "es"),
  robots: esRobots,
  openGraph: {
    type: "profile",
    siteName: siteConfig.name,
    locale: ogLocale.es,
    title: `${TITLE} — ${siteConfig.name}`,
    description: DESCRIPTION,
    url: absoluteUrl("/es/about"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} — ${siteConfig.name}`,
    description: DESCRIPTION,
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-16">
      <JsonLd
        schemas={[
          profilePageSchema("es"),
          personSchema(),
          breadcrumbSchema([
            { name: "Inicio", path: "/es" },
            { name: "Sobre mí", path: "/es/about" },
          ]),
        ]}
      />
      <section>
        <p className="eyebrow">Sobre mí</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink">
          Roman Prokashev
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          Ayudo a empresas técnicas a construir funciones de marketing que generan crecimiento
          medible, una posición de mercado más sólida y mejores resultados de ingresos.
        </p>
        <div className="mt-5 space-y-5 text-ink-muted">
          <p>
            Mi trabajo se sitúa entre la estrategia, la ejecución y el diseño organizativo. Defino
            dónde debe generar impacto de negocio el marketing, construyo los sistemas que lo hacen
            posible y conecto equipos, canales, datos, flujos de trabajo y toma de decisiones en
            torno a objetivos comerciales claros.
          </p>
          <p>
            Soy especialmente útil para empresas con productos sólidos, audiencias técnicas y una
            complejidad creciente: donde el marketing necesita convertirse en algo más que campañas,
            canales o tácticas aisladas.
          </p>
        </div>
      </section>

      <section aria-labelledby="what-i-build">
        <p className="eyebrow">Servicios</p>
        <h2
          id="what-i-build"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Qué construyo
        </h2>
        <div className="mt-8 space-y-10">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Funciones de marketing que generan ingresos
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Diseño sistemas de marketing que conectan la estrategia de audiencias, el
                posicionamiento, la generación de demanda, el crecimiento del sitio web, el
                lifecycle, la analítica y la alineación con ventas en un único modelo operativo.
              </p>
              <p>
                El objetivo no es más actividad de marketing. El objetivo es una función que sabe de
                dónde viene el crecimiento, cómo priorizar la inversión, cómo medir la calidad y
                cómo escalar lo que funciona.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Estrategia de crecimiento y modelo operativo
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Ayudo a las empresas a clarificar las audiencias objetivo, el papel de cada canal,
                la lógica del presupuesto, las prioridades del funnel, los principios de decisión y
                las responsabilidades de los equipos.
              </p>
              <p>
                Esto incluye decidir qué debe asumir el marketing, qué debe dejar de hacer, dónde
                debe invertir y cómo debe trabajar con producto, ventas, analítica, ingeniería,
                diseño y dirección.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Generación de demanda y crecimiento del pipeline
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Construyo sistemas de generación de demanda B2B en torno a necesidades claras de la
                audiencia, activos de contenido sólidos, distribución de pago y orgánica, flujos de
                lifecycle y una medición centrada en el pipeline.
              </p>
              <p>
                Me importa menos el volumen de leads de forma aislada y más si el marketing crea
                demanda cualificada, conversaciones de venta útiles y valor de negocio medible.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Sitio web, conversión y crecimiento digital
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Utilizo los sitios web como sistemas de crecimiento, no como páginas de marca
                estáticas.
              </p>
              <p>
                Eso significa mejorar la navegación, la estrategia de la página de inicio, las
                landing pages, los recorridos de producto, la experimentación, el diagnóstico de
                conversión y la conexión entre el comportamiento de los usuarios y los resultados
                comerciales.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Medición y calidad de las decisiones
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Construyo una medición de marketing que va más allá del tráfico, los clics y las
                conversiones superficiales.
              </p>
              <p>
                El objetivo es conectar los datos de marketing con el CRM, producto, ventas,
                finanzas y los sistemas internos, para que los equipos puedan entender la calidad,
                la contribución a los ingresos y dónde tomar mejores decisiones.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Operaciones con IA, automatización y flujos de trabajo
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                También diseño sistemas prácticos que hacen que los equipos de marketing sean más
                rápidos y más eficaces.
              </p>
              <p>
                Esto puede incluir flujos de trabajo asistidos por IA, automatizaciones a medida,
                herramientas de reporting, sistemas de producción de contenido, operaciones de
                campañas, mejoras en el enrutamiento de leads y herramientas internas ligeras,
                adaptadas a un problema de negocio concreto.
              </p>
              <p>
                No veo la automatización como un sustituto de la estrategia de marketing. La veo
                como parte de la construcción de una función de marketing más fuerte: menos procesos
                manuales, decisiones más rápidas, mejor flujo de datos y una ejecución más
                escalable.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Crecimiento orgánico y adquisición de audiencias técnicas
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Trabajo en sistemas de crecimiento orgánico para empresas técnicas, incluidos el
                SEO, las operaciones de contenido, la autoridad temática y la adquisición de
                audiencias técnicas.
              </p>
              <p>
                Para las empresas de herramientas para desarrolladores, SaaS y deep tech, la
                visibilidad orgánica no es solo un canal de contenido. Es una capa estratégica de
                crecimiento que sostiene la marca, la demanda, la confianza y la posición de mercado
                a largo plazo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-i-work">
        <p className="eyebrow">Enfoque</p>
        <h2
          id="how-i-work"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Cómo trabajo
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Me hago responsable de los resultados, no de las tareas.
        </p>
        <div className="mt-5 space-y-5 text-ink-muted">
          <p>
            Combino el criterio estratégico con la profundidad de ejecución suficiente para saber
            qué es real, qué es ruido y qué moverá de verdad el negocio.
          </p>
          <p>
            Trabajo bien con la alta dirección porque puedo traducir el marketing a decisiones de
            negocio: impacto, riesgo, inversión, velocidad y complejidad organizativa. También
            trabajo bien con equipos especializados porque entiendo el detalle operativo que hay
            debajo: canales, analítica, contenido, recorridos de producto, experimentación, flujos
            de trabajo y restricciones de ejecución.
          </p>
          <p>
            Mi modo por defecto son prioridades claras, decisiones rápidas, aprendizaje medible y
            estándares altos. Prefiero la estrategia práctica a las presentaciones abstractas, y
            prefiero la ejecución enfocada a la actividad desconectada.
          </p>
        </div>
      </section>

      <section aria-labelledby="fit">
        <p className="eyebrow">Encaje</p>
        <h2
          id="fit"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Dónde soy más relevante
        </h2>
        <p className="mt-4 text-ink-muted">
          Soy más relevante para empresas técnicas que necesitan:
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-ink-muted marker:text-ink-soft">
          <li>construir o rediseñar una función de marketing</li>
          <li>conectar marca, demanda, crecimiento de producto e ingresos</li>
          <li>mejorar la credibilidad del marketing ante la dirección y ventas</li>
          <li>
            dirigirse a desarrolladores, ingenieros, compradores técnicos o audiencias de software
          </li>
          <li>pasar de la ejecución por canales a sistemas integrados de crecimiento</li>
          <li>
            mejorar las operaciones de marketing, la automatización, los flujos de trabajo y la toma
            de decisiones
          </li>
          <li>crear una mejor medición y más visibilidad de los ingresos</li>
          <li>escalar el marketing sin perder el foco estratégico</li>
        </ul>
      </section>

      <section id="contact" aria-labelledby="contact-heading">
        <p className="eyebrow">Contacto</p>
        <h2
          id="contact-heading"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Ponte en contacto
        </h2>
        <div className="mt-4 space-y-4 text-ink-muted">
          <p>
            Trabajo de forma selectiva con empresas donde el marketing tiene el potencial de
            convertirse en una verdadera función de crecimiento, no solo en un equipo de soporte.
          </p>
          <p>
            Si esto te resulta relevante, envíame una nota breve sobre la empresa, la etapa en la
            que está y el problema de marketing que intentas resolver.
          </p>
        </div>
        <div className="mt-6">
          <ContactForm locale="es" />
        </div>
      </section>
    </div>
  );
}
