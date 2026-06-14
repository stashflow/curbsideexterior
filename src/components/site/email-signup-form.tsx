"use client";

import { useState, useTransition } from "react";
import { Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmailSignupForm() {
  const [firstName, setFirstName] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/subscribers/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, zip, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "We could not save your email right now.");
        return;
      }

      setMessage(data.message ?? "You are on the list.");
      setEmail("");
      setFirstName("");
      setZip("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-3 text-cyan-200">
        <Mail className="size-5" />
        <p className="text-sm font-semibold uppercase tracking-[0.22em]">Stay In The Loop</p>
      </div>
      <h3 className="mt-4 font-heading text-4xl font-black uppercase leading-none text-white">
        Simple Seasonal Emails
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
        Helpful cleanup reminders, occasional offers, and service timing updates for Marietta-area homes.
        No daily noise. Unsubscribe any time.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <input
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="First name"
          className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-cyan-300/40"
        />
        <input
          value={zip}
          onChange={(event) => setZip(event.target.value)}
          placeholder="ZIP code"
          className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-cyan-300/40"
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-white outline-none transition focus:border-cyan-300/40 sm:col-span-3"
          required
        />
      </div>
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          {message}
        </div>
      ) : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm leading-6 text-slate-300">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" />
          We use this list for useful updates. Every email includes a one-click unsubscribe link.
        </div>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Joining..." : "Join The List"}
        </Button>
      </div>
    </form>
  );
}
