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
        {/* TODO: replace with Roman's longer bio. Keep the angle of the writing — marketing, organizational design, strategy. */}
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          Bio placeholder. Two or three paragraphs about background, current focus, and the
          kind of work that is interesting.
        </p>
      </section>

      <section aria-labelledby="services">
        <p className="eyebrow">What I do</p>
        <h2
          id="services"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Services
        </h2>
        {/* TODO: list the consulting services on offer — engagement shapes, typical outcomes, who it is for. */}
        <p className="mt-4 text-ink-muted">
          Services placeholder. List of typical engagements, audiences, and outcomes goes here.
        </p>
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
