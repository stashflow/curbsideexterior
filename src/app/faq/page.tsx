import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ChevronDown, MessageSquare, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BUSINESS_PHONE_TEL,
  BUSINESS_TEXT_PHONE_DISPLAY,
  BUSINESS_TEXT_PHONE_TEL,
} from "@/lib/business";

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
  {
    question: "Do I need to have a hose?",
    answer: "Yes. For pressure washing and house washing, we need access to a working outdoor water spigot or hose hookup.",
  },
  {
    question: "Do I need to be home?",
    answer: "Usually no, as long as we have access to the areas being cleaned, working water, and any gate or access instructions.",
  },
  {
    question: "Should I move cars or furniture?",
    answer: "Yes. Move cars, planters, toys, patio furniture, and anything fragile away from the cleaning area before service.",
  },
  {
    question: "Can you quote me without the full form?",
    answer: "Yes. If we meet you in person or you send photos, we can create the quote for you and text the next step.",
  },
  {
    question: "What does trash can cleaning cost?",
    answer: "One bin is $20, two bins are $35, three bins are $50, and each additional bin is $10 for one-time service.",
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
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Button asChild size="lg">
              <Link href="/book">
                <CalendarCheck className="size-4" />
                Book Now
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={`sms:${BUSINESS_TEXT_PHONE_TEL}`}>
                <MessageSquare className="size-4" />
                Text Us Photos
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href={`tel:${BUSINESS_PHONE_TEL}`}>
                <Phone className="size-4" />
                Call
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs font-bold uppercase italic tracking-[0.08em] text-white/60">
            Prefer texting? Send photos to {BUSINESS_TEXT_PHONE_DISPLAY}.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-4xl gap-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group border border-white/10 bg-white/[0.03] transition open:border-[#0B67F0]/60 open:bg-[#0B67F0]/10"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 marker:hidden sm:px-5">
              <h2 className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                {faq.question}
              </h2>
              <ChevronDown className="size-5 shrink-0 text-[#BFD7FF] transition group-open:rotate-180" />
            </summary>
            <div className="border-t border-white/10 px-4 pb-5 pt-4 sm:px-5">
              <p className="text-sm leading-6 text-white/76">{faq.answer}</p>
            </div>
          </details>
        ))}
      </section>
    </main>
  );
}
