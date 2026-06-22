import Link from "next/link";
import { CalendarCheck, MessageSquare, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BUSINESS_PHONE_TEL,
  BUSINESS_TEXT_PHONE_DISPLAY,
  BUSINESS_TEXT_PHONE_TEL,
} from "@/lib/business";
import type { SeoLandingPage } from "@/lib/seo-landing-pages";
import { SITE_URL } from "@/lib/site";

export function SeoLandingPageView({ page }: { page: SeoLandingPage }) {
  const servedAreas = ["Marietta, GA", "Kennesaw, GA", "Smyrna, GA", "East Cobb, GA", "Woodstock, GA", "Roswell, GA"];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.serviceName,
    description: page.description,
    areaServed: servedAreas.map((area) => ({
      "@type": "Place",
      name: area,
    })),
    provider: {
      "@type": "LocalBusiness",
      name: "CURBSIDE EXTERIOR CO.",
      url: SITE_URL,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${page.serviceName} services`,
      itemListElement: page.sections.map((section) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: section.title,
          description: section.body,
        },
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#000_0%,#030303_62%,#0047BD_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 border-t border-white/70 bg-[#075BE6]" />
        <div className="absolute -right-24 bottom-8 h-28 w-80 rotate-[-12deg] border-t border-white/70 bg-[#075BE6]" />
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(120deg,transparent_0%,transparent_55%,rgba(255,255,255,0.08)_56%,transparent_72%)]" />

        <div className="relative mx-auto max-w-7xl">
          <Link href="/" className="text-xs font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
            Back Home
          </Link>
          <div className="mt-12 max-w-3xl">
            <p className="text-sm font-black uppercase italic tracking-[0.08em] text-[#0B67F0]">
              {page.eyebrow}
            </p>
            <h1 className="mt-2 font-heading text-[2.75rem] font-black uppercase italic leading-[0.9] tracking-[0.02em] text-white sm:text-7xl">
              {page.headline}
            </h1>
            <p className="mt-4 max-w-2xl text-base italic leading-7 text-white/90 sm:text-lg">
              {page.intro}
            </p>
            <div className="mt-7 grid gap-3 sm:max-w-2xl sm:grid-cols-3">
              <Button asChild size="lg">
                <Link href="/book">
                  <CalendarCheck className="size-4" />
                  Book Online
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={`sms:${BUSINESS_TEXT_PHONE_TEL}`}>
                  <MessageSquare className="size-4" />
                  Text Photos
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href={`tel:${BUSINESS_PHONE_TEL}`}>
                  <Phone className="size-4" />
                  Call
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-xs font-bold uppercase italic tracking-[0.08em] text-white/72">
              Prefer texting? Send photos to {BUSINESS_TEXT_PHONE_DISPLAY}.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {page.highlights.map((highlight) => (
              <div
                key={highlight}
                className="border border-white/12 bg-black/35 px-3 py-3 text-center text-xs font-bold uppercase italic tracking-[0.08em] text-white"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          {page.sections.map((section) => (
            <article key={section.title} className="border border-white/12 bg-white/[0.03] p-5">
              <h2 className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/72">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#0B67F0]" />
            <h2 className="font-heading text-2xl font-black uppercase italic tracking-[0.04em] text-white">
              Quick Answers
            </h2>
            <div className="h-px flex-1 bg-[#0B67F0]" />
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {page.faqs.map((faq) => (
              <article key={faq.question} className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
                <h3 className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/72">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#075BE6] px-4 py-8 sm:px-6 md:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-heading text-4xl font-black uppercase italic leading-none text-white md:text-6xl">
              Get A Fast Quote
            </h2>
            <p className="mt-2 text-sm font-bold uppercase italic tracking-[0.08em] text-white/90">
              Live estimate. Photos welcome. Final price confirmed.
            </p>
          </div>
          <Button asChild size="lg" className="border-white bg-white text-[#075BE6] hover:bg-white/90">
            <Link href="/book">
              <CalendarCheck className="size-4" />
              Book Now
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
