"use client";

import { useState } from "react";
import clsx from "clsx";

type Status = "idle" | "submitting" | "success" | "error";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setStatus("success");
        setMessage("Thanks — check your inbox to confirm.");
        setEmail("");
        return;
      }
      setStatus("error");
      setMessage(data.error ?? "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <label htmlFor="subscribe-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="subscribe-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink shadow-sm placeholder:text-ink-soft focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className={clsx(
            "rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors",
            "hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>

      {/* Honeypot — bots fill this; humans don't see it. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="subscribe-website">Website</label>
        <input
          id="subscribe-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status === "success" ? (
        <p className="text-sm text-accent" role="status">
          {message}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-700" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
