import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlogPostCard } from "@/components/BlogPostCard";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getAllPosts } from "@/lib/posts";
import { JsonLd, localeRobots, localizedAlternates, personSchema, webSiteSchema } from "@/lib/seo";

// No page-level `openGraph`: like the English homepage, it inherits the
// (Spanish) root layout's — which also keeps the layout-level
// opengraph-image at app/(es)/es/opengraph-image.tsx attached.
export const metadata: Metadata = {
  alternates: localizedAlternates("/", "es"),
  robots: localeRobots("es"),
};

export default function HomePage() {
  const posts = getAllPosts("es").slice(0, 8);

  return (
    <div className="space-y-20">
      <JsonLd schemas={[webSiteSchema(), personSchema()]} />
      <section
        aria-labelledby="hero"
        className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12"
      >
        <div className="max-w-2xl">
          <h1
            id="hero"
            className="font-display text-4xl font-semibold leading-[1.1] tracking-tightish text-ink sm:text-5xl"
          >
            Observaciones sobre marketing, liderazgo y tecnología
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">
            Roman Prokashev. Quince años en marketing, construyendo funciones de marketing eficaces
            desde cero y a gran escala: desde negocios de dos personas hasta compañías con varios
            miles de empleados. Aquí escribo sobre lo que no dejo de observar, y aquí puedes
            contactarme para una selección de proyectos de consultoría.
          </p>
        </div>
        <Image
          src="/images/roman-prokashev.jpeg"
          alt="Retrato de Roman Prokashev"
          width={480}
          height={480}
          priority
          sizes="(min-width: 640px) 240px, 192px"
          className="h-48 w-48 shrink-0 rounded-full object-cover ring-1 ring-rule sm:h-60 sm:w-60"
        />
      </section>

      <div className="grid gap-16 lg:grid-cols-3 lg:gap-12">
        <section aria-labelledby="recent-posts" className="lg:col-span-2">
          <p className="eyebrow">Escritos recientes</p>
          <div className="mt-6 divide-y divide-rule">
            {posts.length === 0 ? (
              <p className="py-8 text-ink-muted">Todavía no hay ensayos publicados.</p>
            ) : (
              posts.map((post) => (
                <BlogPostCard key={post.frontmatter.slug} post={post} locale="es" />
              ))
            )}
          </div>
        </section>

        <aside className="space-y-12 lg:col-span-1">
          <section aria-labelledby="newsletter">
            <p className="eyebrow" id="newsletter">
              Boletín
            </p>
            <p className="mt-3 font-display text-xl font-semibold tracking-tightish text-ink">
              Nuevos ensayos, directos a tu bandeja de entrada.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Nunca más de un correo por artículo. Cancela la suscripción cuando quieras.
            </p>
            <div className="mt-5">
              <SubscribeForm locale="es" />
            </div>
          </section>

          <section aria-labelledby="consulting">
            <p className="eyebrow" id="consulting">
              Consultoría
            </p>
            <p className="mt-3 font-display text-xl font-semibold tracking-tightish text-ink">
              Un número reducido de proyectos al año.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Estrategia de marketing y diseño organizativo para empresas que están pensando en su
              próximo capítulo.
            </p>
            <Link
              href="/es/about#contact"
              className="mt-4 inline-flex items-center text-sm font-medium text-accent hover:text-accent-hover"
            >
              Ponte en contacto →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
