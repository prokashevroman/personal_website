import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BlogPostCard } from "@/components/BlogPostCard";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getAllPosts } from "@/lib/posts";
import { JsonLd, localeRobots, localizedAlternates, personSchema, webSiteSchema } from "@/lib/seo";

// No page-level `openGraph`: like the English homepage, it inherits the (Dutch)
// root layout's — which also keeps the layout-level opengraph-image at
// app/(nl)/nl/opengraph-image.tsx attached.
export const metadata: Metadata = {
  alternates: localizedAlternates("/", "nl"),
  robots: localeRobots("nl"),
};

export default function HomePage() {
  const posts = getAllPosts("nl").slice(0, 8);

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
            Observaties over marketing, leiderschap en technologie
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">
            Roman Prokashev. Vijftien jaar in marketing, waarin ik effectieve marketingfuncties
            opbouwde vanaf nul en op schaal: van bedrijven met twee mensen tot organisaties met
            enkele duizenden medewerkers. Hier schrijf ik over wat me steeds weer opvalt, en hier kun
            je me benaderen voor een beperkt aantal adviesopdrachten.
          </p>
        </div>
        <Image
          src="/images/roman-prokashev.jpeg"
          alt="Portret van Roman Prokashev"
          width={480}
          height={480}
          priority
          sizes="(min-width: 640px) 240px, 192px"
          className="h-48 w-48 shrink-0 rounded-full object-cover ring-1 ring-rule sm:h-60 sm:w-60"
        />
      </section>

      <div className="grid gap-16 lg:grid-cols-3 lg:gap-12">
        <section aria-labelledby="recent-posts" className="lg:col-span-2">
          <p className="eyebrow">Recent geschreven</p>
          <div className="mt-6 divide-y divide-rule">
            {posts.length === 0 ? (
              <p className="py-8 text-ink-muted">Nog geen essays gepubliceerd.</p>
            ) : (
              posts.map((post) => (
                <BlogPostCard key={post.frontmatter.slug} post={post} locale="nl" />
              ))
            )}
          </div>
        </section>

        <aside className="space-y-12 lg:col-span-1">
          <section aria-labelledby="newsletter">
            <p className="eyebrow" id="newsletter">
              Nieuwsbrief
            </p>
            <p className="mt-3 font-display text-xl font-semibold tracking-tightish text-ink">
              Nieuwe essays, rechtstreeks in je inbox.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Nooit meer dan één mail per artikel. Je kunt je altijd afmelden.
            </p>
            <div className="mt-5">
              <SubscribeForm locale="nl" />
            </div>
          </section>

          <section aria-labelledby="consulting">
            <p className="eyebrow" id="consulting">
              Advies
            </p>
            <p className="mt-3 font-display text-xl font-semibold tracking-tightish text-ink">
              Een klein aantal opdrachten per jaar.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Marketingstrategie en organisatieontwerp voor bedrijven die nadenken over hun volgende
              hoofdstuk.
            </p>
            <Link
              href="/nl/about#contact"
              className="mt-4 inline-flex items-center text-sm font-medium text-accent hover:text-accent-hover"
            >
              Neem contact op →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
