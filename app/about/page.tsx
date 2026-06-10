import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "About",
  description: "About Roman Prokashev and how to get in touch.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-16">
      <section>
        <p className="eyebrow">About</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink">
          Roman Prokashev
        </h1>
      </section>

      <section aria-labelledby="services">
        <p className="eyebrow">What I do</p>
        <h2
          id="services"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Services
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          I help technical companies turn marketing into a measurable growth engine.
        </p>
        <dl className="mt-8 space-y-6">
          <div>
            <dt className="font-display text-lg font-semibold text-ink">Growth strategy</dt>
            <dd className="mt-1 text-ink-muted">
              Audience strategy, positioning, channel roles, budget logic, full-funnel
              planning, and prioritization.
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg font-semibold text-ink">
              B2B demand generation
            </dt>
            <dd className="mt-1 text-ink-muted">
              Lead generation systems, research-led campaigns, paid acquisition, lifecycle
              flows, and pipeline-focused measurement.
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg font-semibold text-ink">
              CRO and website growth
            </dt>
            <dd className="mt-1 text-ink-muted">
              Growth through A/B experiments, conversion diagnostics, homepage and navigation
              strategy, landing page testing, and product journey optimization.
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg font-semibold text-ink">
              SEO, GEO, and AI visibility
            </dt>
            <dd className="mt-1 text-ink-muted">
              Organic growth strategy, search visibility, content systems, generative engine
              optimization, AI discovery, and technical audience acquisition.
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg font-semibold text-ink">
              Marketing measurement
            </dt>
            <dd className="mt-1 text-ink-muted">
              Web analytics connected with CRM, product, sales, finance, and internal data
              systems, so teams can measure quality, not just traffic.
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg font-semibold text-ink">
              Developer audience marketing
            </dt>
            <dd className="mt-1 text-ink-muted">
              Campaigns, content strategy, partnerships, and go-to-market thinking for
              developer tools, AI, SaaS, and deep-tech products.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="how-i-work">
        <p className="eyebrow">Approach</p>
        <h2
          id="how-i-work"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          How I work
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          I take ownership of the outcome, not just the task.
        </p>
        <div className="mt-5 space-y-5 text-ink-muted">
          <p>
            I combine business acumen with hands-on marketing judgment: understanding the
            audience, defining the goal, choosing the right levers, and making decisions
            based on impact rather than channel activity.
          </p>
          <p>
            I work cross-functionally with product, sales, analytics, engineering, design,
            legal, and leadership teams. I prefer fast decisions, data-driven iterations,
            clear ownership, and constant learning over slow, over-polished planning.
          </p>
          <p>
            What I bring that is less common is mental flexibility: moving between strategic
            alignment and communication with senior leadership and the execution detail
            underneath, and bringing my own toolset of automations that I tailor to each
            business.
          </p>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-heading">
        <p className="eyebrow">Contact</p>
        <h2
          id="contact-heading"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Get in touch
        </h2>
        <p className="mt-3 text-ink-muted">
          Tell me about the company, what is on your mind, and how I can help. I read
          everything and reply within a few days.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
