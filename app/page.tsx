import Image from "next/image";
import Link from "next/link";
import { BlogPostCard } from "@/components/BlogPostCard";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 8);

  return (
    <div className="space-y-20">
      <section
        aria-labelledby="hero"
        className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12"
      >
        <div className="max-w-2xl">
          <h1
            id="hero"
            className="font-display text-4xl font-semibold leading-[1.1] tracking-tightish text-ink sm:text-5xl"
          >
            Observations on marketing, leadership, and technology<span className="text-accent">.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">
            Roman Prokashev. Fifteen years in marketing, building effective marketing functions from the ground up and at scale: from two-person businesses to companies with several thousand employees. This is where I write about what I keep noticing, and where you can reach me for selected consulting work.
          </p>
        </div>
        <Image
          src="/images/roman-prokashev.jpeg"
          alt="Portrait of Roman Prokashev"
          width={480}
          height={480}
          priority
          sizes="(min-width: 640px) 240px, 192px"
          className="h-48 w-48 shrink-0 rounded-full object-cover ring-1 ring-rule sm:h-60 sm:w-60"
        />
      </section>

      <div className="grid gap-16 lg:grid-cols-3 lg:gap-12">
        <section aria-labelledby="recent-posts" className="lg:col-span-2">
          <p className="eyebrow">Recent writing</p>
          <div className="mt-6 divide-y divide-rule">
            {posts.length === 0 ? (
              <p className="py-8 text-ink-muted">No posts published yet.</p>
            ) : (
              posts.map((post) => <BlogPostCard key={post.frontmatter.slug} post={post} />)
            )}
          </div>
        </section>

        <aside className="space-y-12 lg:col-span-1">
          <section aria-labelledby="newsletter">
            <p className="eyebrow" id="newsletter">Newsletter</p>
            <p className="mt-3 font-display text-xl font-semibold tracking-tightish text-ink">
              New essays, straight to your inbox.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Never more than one email per article. Unsubscribe whenever.
            </p>
            <div className="mt-5">
              <SubscribeForm />
            </div>
          </section>

          <section aria-labelledby="consulting">
            <p className="eyebrow" id="consulting">Consulting</p>
            <p className="mt-3 font-display text-xl font-semibold tracking-tightish text-ink">
              A small number of engagements each year.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Marketing strategy and organizational design for companies thinking through
              their next chapter.
            </p>
            <Link
              href="/about#contact"
              className="mt-4 inline-flex items-center text-sm font-medium text-accent hover:text-accent-hover"
            >
              Get in touch →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
