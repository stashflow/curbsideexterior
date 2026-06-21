import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarCheck,
  Camera,
  ClipboardCheck,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BUSINESS_INSTAGRAM_URL, BUSINESS_PHONE_DISPLAY } from "@/lib/business";

export type VerticalLandingPageData = {
  eyebrow: string;
  headline: string;
  subhead: string;
  audience: string;
  proof: string[];
  services: string[];
  workflow: Array<{ title: string; body: string }>;
  scripts: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
};

export function VerticalLandingPage({ page }: { page: VerticalLandingPageData }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <section className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#000_0%,#050505_58%,#075BE6_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[#075BE6]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(120deg,transparent_0%,transparent_55%,rgba(255,255,255,0.08)_56%,transparent_72%)]" />

        <div className="relative mx-auto max-w-7xl">
          <Link href="/" className="text-xs font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
            Back Home
          </Link>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_25rem] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
                {page.eyebrow}
              </p>
              <h1 className="mt-3 max-w-4xl font-heading text-[3rem] font-black uppercase italic leading-[0.88] text-white sm:text-7xl">
                {page.headline}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/84 sm:text-lg">{page.subhead}</p>
              <div className="mt-7 grid gap-3 sm:max-w-xl sm:grid-cols-2">
                <Button asChild size="lg">
                  <Link href="/book">
                    <CalendarCheck className="size-4" />
                    Request Estimate
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href={BUSINESS_INSTAGRAM_URL} target="_blank" rel="noreferrer">
                    <Camera className="size-4" />
                    Text Photos
                  </Link>
                </Button>
              </div>
              <p className="mt-3 text-xs font-bold uppercase italic tracking-[0.08em] text-white/72">
                Prefer texting? Send photos to {BUSINESS_PHONE_DISPLAY}.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-black/35 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
              <Building2 className="size-8 text-[#BFD7FF]" />
              <p className="mt-4 text-xs font-black uppercase italic tracking-[0.16em] text-white/50">
                Built For
              </p>
              <p className="mt-2 font-heading text-4xl font-black uppercase italic leading-none text-white">
                {page.audience}
              </p>
              <div className="mt-5 grid gap-2">
                {page.proof.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2">
                    <ShieldCheck className="size-4 shrink-0 text-[#BFD7FF]" />
                    <span className="text-sm text-white/78">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {page.services.map((service) => (
              <div key={service} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-4">
                <BadgeCheck className="size-5 text-[#0B67F0]" />
                <p className="mt-3 text-sm font-bold uppercase italic tracking-[0.08em] text-white">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">How It Works</p>
            <h2 className="mt-3 font-heading text-5xl font-black uppercase italic leading-none text-white">
              Simple For Busy Properties
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {page.workflow.map((step) => (
              <article key={step.title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5">
                <ClipboardCheck className="size-5 text-[#BFD7FF]" />
                <h3 className="mt-4 font-heading text-3xl font-black uppercase italic leading-none text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Use Cases</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {page.scripts.map((script) => (
              <article key={script.title} className="rounded-[1.4rem] border border-white/10 bg-black/35 p-5">
                <Sparkles className="size-5 text-[#BFD7FF]" />
                <h3 className="mt-4 font-heading text-3xl font-black uppercase italic leading-none text-white">
                  {script.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{script.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-5xl font-black uppercase italic leading-none text-white">
            Quick Answers
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {page.faqs.map((faq) => (
              <article key={faq.question} className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5">
                <h3 className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#075BE6] px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-heading text-5xl font-black uppercase italic leading-none text-white">
              Ready For A Cleaner Property?
            </h2>
            <p className="mt-2 text-sm font-bold uppercase italic tracking-[0.08em] text-white/90">
              Licensed and insured. Photos welcome. Fast estimates.
            </p>
          </div>
          <Button asChild size="lg" className="border-white bg-white text-[#075BE6] hover:bg-white/90">
            <Link href="/book">
              <MessageSquare className="size-4" />
              Start Quote
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
