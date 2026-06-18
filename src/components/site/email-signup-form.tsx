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
    <form onSubmit={handleSubmit} className="rounded-lg border border-white/12 bg-white/[0.035] p-4 sm:p-6">
      <div className="flex items-center gap-3 text-cyan-200">
        <Mail className="size-5" />
        <p className="text-xs font-bold uppercase italic tracking-[0.16em]">Stay In The Loop</p>
      </div>
      <h3 className="mt-3 font-heading text-3xl font-black uppercase italic leading-none text-white sm:text-4xl">
        Seasonal Reminders
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
        Useful reminders and occasional offers. Unsubscribe any time.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <input
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="First name"
          className="h-12 rounded-md border border-white/12 bg-black/35 px-4 text-white outline-none transition focus:border-[#0B67F0]"
        />
        <input
          value={zip}
          onChange={(event) => setZip(event.target.value)}
          placeholder="ZIP code"
          className="h-12 rounded-md border border-white/12 bg-black/35 px-4 text-white outline-none transition focus:border-[#0B67F0]"
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="h-12 rounded-md border border-white/12 bg-black/35 px-4 text-white outline-none transition focus:border-[#0B67F0] sm:col-span-3"
          required
        />
      </div>
      {error ? (
        <div className="mt-4 rounded-md border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mt-4 rounded-md border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
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
