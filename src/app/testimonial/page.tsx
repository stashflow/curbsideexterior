import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Leave A Testimonial | CURBSIDE EXTERIOR CO.",
  description:
    "Share a quick testimonial for CURBSIDE EXTERIOR CO. with your name, star rating, and a short message.",
  alternates: {
    canonical: "/testimonial",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TestimonialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const success = params.success === "1";
  const hasError = params.error === "invalid";

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#0B67F0]/25 blur-3xl" />
        <div className="absolute -bottom-28 left-8 h-56 w-56 rounded-full bg-[#075BE6]/20 blur-3xl" />
        <div className="relative">
          <Link href="/" className="text-xs font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
            Back Home
          </Link>
          <p className="mt-8 text-sm font-black uppercase italic tracking-[0.08em] text-[#0B67F0]">
            Customer Testimonial
          </p>
          <h1 className="mt-2 font-heading text-5xl font-black uppercase italic leading-none text-white sm:text-7xl">
            How Did We Do?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/76 sm:text-base">
            This takes less than a minute. Your note helps us improve and helps local homeowners know what to expect.
          </p>

          {success ? (
            <div className="mt-6 rounded-[1.5rem] border border-emerald-300/25 bg-emerald-400/10 p-5">
              <p className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                Thank You
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-100">
                Your testimonial was submitted. We really appreciate it.
              </p>
              <Button asChild className="mt-5">
                <Link href="/">Back Home</Link>
              </Button>
            </div>
          ) : (
            <form action="/api/testimonials" method="post" className="mt-6 grid gap-4">
              {hasError ? (
                <p className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  Please add your name, choose 1-5 stars, and write a short message.
                </p>
              ) : null}
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Name</span>
                <input
                  name="customerName"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Rating</span>
                <select
                  name="rating"
                  defaultValue="5"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} star{rating === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Message</span>
                <textarea
                  name="message"
                  required
                  minLength={8}
                  maxLength={800}
                  placeholder="Example: The driveway looks brand new and booking was easy."
                  className="min-h-36 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
                />
              </label>
              <Button type="submit" size="lg" className="h-14">
                <Star className="size-4" />
                Submit Testimonial
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
