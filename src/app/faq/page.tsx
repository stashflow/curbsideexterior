import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BUSINESS_INSTAGRAM_URL, BUSINESS_PHONE_DISPLAY } from "@/lib/business";

export const metadata: Metadata = {
  title: "Pressure Washing FAQ | CURBSIDE EXTERIOR CO.",
  description:
    "Quick answers about CURBSIDE EXTERIOR CO. pressure washing quotes, photo estimates, pricing, scheduling, payments, and service areas near Marietta.",
  alternates: {
    canonical: "/faq",
  },
};

const faqs = [
  {
    question: "Can I just send photos?",
    answer: "Yes. Instagram is fastest. Send driveway, walkway, patio, siding, or fence photos and we can estimate from there.",
  },
  {
    question: "Is the online price final?",
    answer: "It is an estimate range. We confirm the final price before service so there are no weird surprises.",
  },
  {
    question: "Do I need to know square footage?",
    answer: "No. Pick the closest size option or upload photos. We will confirm before charging.",
  },
  {
    question: "When can you come out?",
    answer: "Choose your preferred date in booking. We review the route and confirm the best window.",
  },
  {
    question: "Do you wash siding?",
    answer: "Yes. Choose only the sides that need cleaning so the estimate stays fair.",
  },
  {
    question: "What areas do you serve?",
    answer: "Marietta, Kennesaw, Smyrna, East Cobb, Woodstock, Roswell, and nearby neighborhoods.",
  },
  {
    question: "Do I pay online?",
    answer: "Some jobs require a deposit or full checkout. Photo/manual quotes can be confirmed first.",
  },
  {
    question: "What if I am not sure what to pick?",
    answer: "Choose Not sure / upload photo or DM photos. Simple beats perfect.",
  },
];

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.3)] sm:p-8">
        <div>
          <Link href="/" className="text-xs font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
            Back Home
          </Link>
          <p className="mt-6 text-sm font-black uppercase italic tracking-[0.08em] text-[#0B67F0]">
            Quick Answers
          </p>
          <h1 className="mt-2 font-heading text-5xl font-black uppercase italic leading-none text-white sm:text-7xl">
            FAQ
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/76 sm:text-base">
            Short answers. No pressure. If a photo is easier, send one.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg">
              <Link href="/book">
                <CalendarCheck className="size-4" />
                Book Now
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={BUSINESS_INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <MessageSquare className="size-4" />
                Text Us Photos
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs font-bold uppercase italic tracking-[0.08em] text-white/60">
            Prefer texting? Send photos to {BUSINESS_PHONE_DISPLAY}.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {faqs.map((faq) => (
          <article key={faq.question} className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-heading text-3xl font-black uppercase italic leading-none text-white">
              {faq.question}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/72">{faq.answer}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
