"use client";

import { useState } from "react";
import clsx from "clsx";

type Status = "idle" | "submitting" | "success" | "error";

type Fields = {
  name: string;
  email: string;
  company: string;
  message: string;
  website: string;
};

const empty: Fields = { name: "", email: "", company: "", message: "", website: "" };

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFeedback("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setStatus("success");
        setFeedback("Thanks — your message is on its way. I'll reply soon.");
        setValues(empty);
        return;
      }
      setStatus("error");
      setFeedback(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setFeedback("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="contact-name"
          label="Name"
          required
          value={values.name}
          onChange={(v) => update("name", v)}
          autoComplete="name"
        />
        <Field
          id="contact-email"
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(v) => update("email", v)}
          autoComplete="email"
        />
      </div>
      <Field
        id="contact-company"
        label="Company (optional)"
        value={values.company}
        onChange={(v) => update("company", v)}
        autoComplete="organization"
      />
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          rows={6}
          minLength={20}
          className="mt-2 w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink shadow-sm placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          A short paragraph is enough — 20+ characters.
        </p>
      </div>

      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className={clsx(
          "inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors",
          "hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>

      {status === "success" ? (
        <p className="text-sm text-accent" role="status">
          {feedback}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-700" role="alert">
          {feedback}
        </p>
      ) : null}
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email";
  required?: boolean;
  autoComplete?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id.replace(/^contact-/, "")}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink shadow-sm placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}
