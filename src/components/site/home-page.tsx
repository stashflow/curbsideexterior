"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  CalendarCheck,
  CircleDollarSign,
  Droplets,
  Home,
  Info,
  Menu,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  SprayCan,
  Trash2,
  Zap,
} from "lucide-react";

import { BrandLogo } from "@/components/site/brand-logo";
import { EmailSignupForm } from "@/components/site/email-signup-form";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

const quickActions = [
  {
    icon: CalendarCheck,
    title: "Book Online",
    body: "A few taps.",
  },
  {
    icon: CircleDollarSign,
    title: "Instant Quotes",
    body: "No waiting.",
  },
  {
    icon: Info,
    title: "All The Info",
    body: "Plain answers.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    body: "Works fast.",
  },
];

const services = [
  {
    icon: Droplets,
    title: "Pressure Washing",
    body: "Driveways, walkways, patios, siding, fences.",
  },
  {
    icon: Home,
    title: "Soft Washing",
    body: "Gentler cleaning for home exteriors.",
  },
  {
    icon: Trash2,
    title: "Trash Bin Cleaning",
    body: "Cleaner bins, less odor.",
  },
  {
    icon: SprayCan,
    title: "Curb Number Painting",
    body: "Coming soon.",
  },
];

const why = [
  {
    icon: ShieldCheck,
    title: "Professional Results",
  },
  {
    icon: BadgeCheck,
    title: "Satisfaction First",
  },
  {
    icon: Home,
    title: "Boost Curb Appeal",
  },
];

const areas = ["Marietta", "Kennesaw", "Smyrna", "East Cobb", "Woodstock", "Roswell"];

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#0B67F0]" />
      <h2 className="font-heading text-2xl font-black uppercase italic tracking-[0.04em] text-white">
        {children}
      </h2>
      <div className="h-px flex-1 bg-[#0B67F0]" />
    </div>
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/92 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="#top" aria-label="CURBSIDE home">
            <BrandLogo className="h-12 w-44 sm:h-14 sm:w-56" />
          </Link>
          <div className="hidden items-center gap-8 text-xs font-bold uppercase italic tracking-[0.16em] text-white/80 md:flex">
            <Link href="#services" className="hover:text-[#0B67F0]">
              Services
            </Link>
            <Link href="#areas" className="hover:text-[#0B67F0]">
              Areas
            </Link>
            <Link href="#contact" className="hover:text-[#0B67F0]">
              Contact
            </Link>
          </div>
          <Link
            href="#services"
            className="flex size-11 items-center justify-center border border-white/16 bg-white/[0.03] text-white md:hidden"
            aria-label="Jump to services"
          >
            <Menu className="size-6" />
          </Link>
          <Button asChild className="hidden md:inline-flex">
            <Link href="/book">Book Now</Link>
          </Button>
        </nav>
      </header>

      <main id="top" className="pb-24 md:pb-0">
        <section className="relative min-h-[calc(100svh-73px)] overflow-hidden px-4 pb-7 pt-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#000_0%,#030303_62%,#0047BD_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[#075BE6]" />
          <div className="absolute -right-24 bottom-8 h-28 w-80 rotate-[-12deg] border-t border-white/70 bg-[#075BE6]" />
          <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(120deg,transparent_0%,transparent_55%,rgba(255,255,255,0.08)_56%,transparent_72%)]" />

          <div className="relative mx-auto flex min-h-[calc(100svh-106px)] max-w-7xl flex-col">
            <FadeIn delay={0.05} className="mt-10 max-w-xl md:mt-16">
              <p className="text-sm font-black uppercase italic tracking-[0.08em] text-[#0B67F0]">
                Professional
              </p>
              <h1 className="mt-2 font-heading text-[2.45rem] font-black uppercase italic leading-[0.92] tracking-[0.02em] text-white sm:text-6xl">
                Exterior Cleaning
                <span className="block text-[#0B67F0]">Made Easy.</span>
              </h1>
              <p className="mt-3 max-w-[21rem] text-[0.95rem] italic leading-6 text-white/92 sm:max-w-lg sm:text-lg">
                Book online, get an instant quote, and move on with your day.
              </p>
            </FadeIn>

            <FadeIn delay={0.1} className="mt-6 grid gap-3 sm:max-w-md">
              <Button asChild size="lg" className="h-12 w-full sm:h-14">
                <Link href="/book">
                  <CalendarCheck className="size-4" />
                  Book Now
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="h-12 w-full sm:h-14">
                <Link href="/book">
                  <Zap className="size-4" />
                  Get Instant Quote
                </Link>
              </Button>
            </FadeIn>

            <FadeIn delay={0.15} className="mt-7">
              <div className="grid grid-cols-4 divide-x divide-[#0B67F0]/60 border-y border-[#0B67F0]/70 py-3 md:max-w-3xl">
                {quickActions.map((item) => (
                  <Link key={item.title} href="/book" className="px-2 text-center">
                    <div className="mx-auto flex size-11 items-center justify-center rounded-full border-2 border-[#0B67F0] text-white">
                      <item.icon className="size-5" />
                    </div>
                    <p className="mt-3 text-[0.68rem] font-black uppercase italic leading-4 text-[#0B67F0]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-[0.7rem] leading-4 text-white/90">{item.body}</p>
                  </Link>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="mt-6 md:hidden">
              <SectionTitle>Our Services</SectionTitle>
              <div className="mt-4 grid grid-cols-4 divide-x divide-white/14 border-y border-white/16 py-4">
                {services.map((service) => (
                  <Link
                    key={service.title}
                    href="/book"
                    className="flex min-h-[5.5rem] flex-col items-center px-2 text-center"
                  >
                    <service.icon className="size-8 text-white" />
                    <span className="mt-3 text-[0.66rem] font-black uppercase italic leading-4 text-white">
                      {service.title}
                    </span>
                  </Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        <section id="services" className="bg-[#050505] px-4 py-8 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle>Services</SectionTitle>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {services.map((service) => (
                <Link
                  key={service.title}
                  href="/book"
                  className="border border-white/12 bg-white/[0.03] p-4 transition hover:border-[#0B67F0]"
                >
                  <service.icon className="size-8 text-white" />
                  <h3 className="mt-4 font-heading text-2xl font-black uppercase italic leading-none text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/72">{service.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-8 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle>Why Choose Curbside?</SectionTitle>
            <div className="mt-6 grid grid-cols-3 divide-x divide-[#0B67F0]/50 border-y border-[#0B67F0]/50 py-5">
              {why.map((item) => (
                <div key={item.title} className="px-3 text-center">
                  <item.icon className="mx-auto size-9 text-white" />
                  <p className="mt-3 text-[0.78rem] font-black uppercase italic leading-4 text-white md:text-sm">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="areas" className="bg-[#050505] px-4 py-8 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="text-sm font-black uppercase italic tracking-[0.08em] text-[#0B67F0]">
                Service Area
              </p>
              <h2 className="mt-2 font-heading text-4xl font-black uppercase italic leading-none text-white">
                Marietta And Nearby
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {areas.map((area) => (
                <Link
                  key={area}
                  href="/book"
                  className="border border-white/12 bg-black/35 px-3 py-3 text-center text-sm font-bold uppercase italic tracking-[0.08em] text-white"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-black px-4 py-8 sm:px-6 md:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div>
              <p className="text-sm font-black uppercase italic tracking-[0.08em] text-[#0B67F0]">
                No Spam
              </p>
              <h2 className="mt-2 font-heading text-4xl font-black uppercase italic leading-none text-white">
                Helpful Reminders
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/72">
                Short seasonal updates. Easy unsubscribe.
              </p>
            </div>
            <EmailSignupForm />
          </div>
        </section>

        <section id="contact" className="bg-[#075BE6] px-4 py-8 sm:px-6 md:py-14 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-heading text-4xl font-black uppercase italic leading-none text-white md:text-6xl">
                Ready To Book?
              </h2>
              <p className="mt-2 text-sm font-bold uppercase italic tracking-[0.08em] text-white/90">
                Fast. Easy. Convenient.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild size="lg" className="border-white bg-white text-[#075BE6] hover:bg-white/90">
                <Link href="/book">
                  <CalendarCheck className="size-4" />
                  Book Now
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="border-white/80 bg-black/20">
                <Link href="sms:+16787096690">
                  <MessageSquare className="size-4" />
                  Text Now
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-md md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Button asChild size="lg" className="h-12">
            <Link href="/book">
              <CalendarCheck className="size-4" />
              Book Now
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="h-12">
            <Link href="sms:+16787096690">
              <MessageSquare className="size-4" />
              Text Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
