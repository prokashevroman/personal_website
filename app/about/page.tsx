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
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          I help technical companies build marketing functions that create measurable
          growth, stronger market position, and better revenue outcomes.
        </p>
        <div className="mt-5 space-y-5 text-ink-muted">
          <p>
            My work sits between strategy, execution, and organizational design. I define
            where marketing should create business impact, build the systems that make it
            happen, and connect teams, channels, data, workflows, and decision-making
            around clear commercial goals.
          </p>
          <p>
            I am especially useful for companies that have strong products, technical
            audiences, and growing complexity: where marketing needs to become more than
            campaigns, channels, or isolated tactics.
          </p>
        </div>
      </section>

      <section aria-labelledby="what-i-build">
        <p className="eyebrow">Practice</p>
        <h2
          id="what-i-build"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          What I build
        </h2>
        <div className="mt-8 space-y-10">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Revenue-generating marketing functions
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                I design marketing systems that connect audience strategy, positioning,
                demand generation, website growth, lifecycle, analytics, and sales
                alignment into one operating model.
              </p>
              <p>
                The goal is not more marketing activity. The goal is a function that knows
                where growth comes from, how to prioritize investment, how to measure
                quality, and how to scale what works.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Growth strategy and operating model
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                I help companies clarify target audiences, channel roles, budget logic,
                funnel priorities, decision principles, and team responsibilities.
              </p>
              <p>
                This includes deciding what marketing should own, what it should stop
                doing, where it should invest, and how it should work with product, sales,
                analytics, engineering, design, and leadership.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Demand generation and pipeline growth
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                I build B2B demand generation systems around clear audience needs, strong
                content assets, paid and organic distribution, lifecycle flows, and
                pipeline-focused measurement.
              </p>
              <p>
                I care less about lead volume in isolation and more about whether
                marketing creates qualified demand, useful sales conversations, and
                measurable business value.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Website, conversion, and digital growth
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>I use websites as growth systems, not static brand pages.</p>
              <p>
                That means improving navigation, homepage strategy, landing pages, product
                journeys, experimentation, conversion diagnostics, and the connection
                between user behavior and commercial outcomes.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Measurement and decision quality
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                I build marketing measurement that goes beyond traffic, clicks, and
                shallow conversions.
              </p>
              <p>
                The goal is to connect marketing data with CRM, product, sales, finance,
                and internal systems so teams can understand quality, revenue
                contribution, and where to make better decisions.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              AI-enabled operations, automation, and workflows
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                I also design practical systems that make marketing teams faster and more
                effective.
              </p>
              <p>
                This can include AI-assisted workflows, custom automations, reporting
                tools, content production systems, campaign operations, lead routing
                improvements, and lightweight internal tools tailored to a specific
                business problem.
              </p>
              <p>
                I do not see automation as a replacement for marketing strategy. I see it
                as part of building a stronger marketing function: fewer manual processes,
                faster decisions, better data flow, and more scalable execution.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Organic growth and technical audience acquisition
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                I work on organic growth systems for technical companies, including SEO,
                content operations, topic authority, and technical audience acquisition.
              </p>
              <p>
                For companies in developer tools, SaaS, and deep tech, organic visibility
                is not just a content channel. It is a strategic growth layer that
                supports brand, demand, trust, and long-term market position.
              </p>
            </div>
          </div>
        </div>
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
          I take ownership of outcomes, not tasks.
        </p>
        <div className="mt-5 space-y-5 text-ink-muted">
          <p>
            I combine strategic judgment with enough execution depth to know what is real,
            what is noise, and what will actually move the business.
          </p>
          <p>
            I work well with senior leadership because I can translate marketing into
            business trade-offs: impact, risk, investment, speed, and organizational
            complexity. I also work well with specialist teams because I understand the
            operating detail underneath: channels, analytics, content, product journeys,
            experimentation, workflows, and execution constraints.
          </p>
          <p>
            My default mode is clear priorities, fast decisions, measurable learning, and
            high standards. I prefer practical strategy over abstract decks, and I prefer
            focused execution over disconnected activity.
          </p>
        </div>
      </section>

      <section aria-labelledby="fit">
        <p className="eyebrow">Fit</p>
        <h2
          id="fit"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Where I am most relevant
        </h2>
        <p className="mt-4 text-ink-muted">
          I am most relevant for technical companies that need to:
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-ink-muted marker:text-ink-soft">
          <li>build or redesign a marketing function</li>
          <li>connect brand, demand, product growth, and revenue</li>
          <li>improve marketing’s credibility with leadership and sales</li>
          <li>
            market to developers, engineers, technical buyers, or software audiences
          </li>
          <li>move from channel execution to integrated growth systems</li>
          <li>
            improve marketing operations, automation, workflows, and decision-making
          </li>
          <li>create better measurement and revenue visibility</li>
          <li>scale marketing without losing strategic focus</li>
        </ul>
      </section>

      <section id="contact" aria-labelledby="contact-heading">
        <p className="eyebrow">Contact</p>
        <h2
          id="contact-heading"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Get in touch
        </h2>
        <div className="mt-4 space-y-4 text-ink-muted">
          <p>
            I work selectively with companies where marketing has the potential to become
            a real growth function, not just a support team.
          </p>
          <p>
            If that sounds relevant, send a short note about the company, the stage you
            are in, and the marketing problem you are trying to solve.
          </p>
        </div>
        <div className="mt-6">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
