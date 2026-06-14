"use client";

import { useEffect, useEffectEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  House,
  Lock,
  MapPinned,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Trash2,
  Zap,
} from "lucide-react";

import { BrandLogo } from "@/components/site/brand-logo";
import { EmailSignupForm } from "@/components/site/email-signup-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Droplets,
    title: "Pressure Washing",
    description:
      "Driveways, sidewalks, patios, siding, and fences cleaned with professional equipment.",
    items: ["Driveways", "Walkways", "Patios", "House siding", "Fences"],
  },
  {
    icon: Trash2,
    title: "Trash Can Cleaning",
    description:
      "Sanitize bins, remove odors, and keep your cans cleaner between pickups.",
    items: ["Odor removal", "Sanitizing", "Eco-friendly cleaning"],
  },
  {
    icon: SprayCan,
    title: "Curb Number Painting",
    description:
      "High-visibility curb numbers that improve curb appeal and make your address easier to spot.",
    items: ["Clean layout", "Easy to read", "Address visibility"],
    badge: "Coming Soon",
  },
];

const quickFacts = [
  "Book online in a few clear steps",
  "A real person reviews every request",
  "Serving Marietta and nearby areas",
  "Text or DM if you want help",
];

const trustItems = [
  "Fully insured",
  "Fast scheduling",
  "Professional equipment",
  "Clear communication",
];

const reasons = [
  {
    icon: ShieldCheck,
    title: "Clear from the start",
    body: "People trust simple service. We explain the job, the quote, and the next step in plain English.",
  },
  {
    icon: Sparkles,
    title: "Cleaner looking property",
    body: "The goal is straightforward: cleaner surfaces, better curb appeal, and a property that looks cared for.",
  },
  {
    icon: Clock3,
    title: "Easy for busy families",
    body: "Quick online booking plus simple text and DM communication keeps the process easy and low-stress.",
  },
  {
    icon: BadgeCheck,
    title: "Built to feel organized",
    body: "A polished booking process helps homeowners and property managers feel like the job will be handled right.",
  },
];

const processSteps = [
  {
    title: "Book online",
    body: "Choose the service, add the details, and send the request in one place.",
  },
  {
    title: "See the pricing",
    body: "The form shows clear pricing and tells you exactly what happens next.",
  },
  {
    title: "Schedule service",
    body: "Choose a time that works for your home, rental, or neighborhood schedule.",
  },
  {
    title: "Enjoy the result",
    body: "We clean the surface properly so your property looks sharper and more maintained.",
  },
];

const serviceAreas = ["Marietta", "Kennesaw", "Smyrna", "East Cobb", "Woodstock", "Roswell"];

const bookingTrustCards = [
  {
    title: "Real quote details",
    body: "The form asks what needs to be cleaned, where the property is, and what timing works best so the quote is more useful from the start.",
  },
  {
    title: "Real person review",
    body: "A person still reviews the request before the job is confirmed. That keeps scheduling clear and helps catch special details early.",
  },
  {
    title: "Clear payment step",
    body: "If payment is needed, the site tells the customer exactly what happens next instead of surprising them halfway through.",
  },
  {
    title: "Simple follow-up",
    body: "Customers can book online, then still text or DM if they want help. That keeps the process modern and easy to follow.",
  },
];

const faqItems = [
  {
    question: "What do you clean?",
    answer:
      "We handle pressure washing for driveways, sidewalks, patios, siding, and fences, plus trash can cleaning and soon curb number painting.",
  },
  {
    question: "How do I get a quote?",
    answer:
      "Book online for the best experience, or send a text or Instagram DM if you want help first.",
  },
  {
    question: "Do I need to be home?",
    answer:
      "Usually not, as long as we have clear access and we’ve confirmed the scope ahead of time.",
  },
  {
    question: "How does online booking work?",
    answer:
      "You fill out the job details, see the estimate or next step, and then we review the request and confirm the schedule. A real person still looks over every booking.",
  },
  {
    question: "When do I pay?",
    answer:
      "Some services may ask for payment or a deposit during booking. If that happens, the site explains it clearly before checkout.",
  },
];

const premiumEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: premiumEase, delay },
  }),
};

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body: string;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      custom={0}
      variants={fadeUp}
      className={cn("max-w-3xl space-y-4", align === "center" && "mx-auto text-center")}
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyan-200">
        <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(18,182,255,0.95)]" />
        {eyebrow}
      </div>
      <h2 className="font-heading text-4xl font-black uppercase leading-none tracking-[0.04em] text-white sm:text-5xl">
        {title}
      </h2>
      <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{body}</p>
    </motion.div>
  );
}

function ProofCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center gap-3 text-cyan-200">
        <BadgeCheck className="size-5" />
        <Sparkles className="size-5" />
      </div>
      <h3 className="mt-5 font-heading text-3xl font-black uppercase leading-none text-white">
        {title}
      </h3>
      <p className="mt-4 text-base leading-7 text-slate-300">{body}</p>
      <div className="mt-6 rounded-2xl border border-white/8 bg-black/25 px-4 py-4 text-sm text-slate-300">
        Clear steps, clear pricing, and clear follow-up help the booking process feel dependable.
      </div>
    </div>
  );
}

export function HomePage() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const glowX = useSpring(mouseX, { stiffness: 120, damping: 24 });
  const glowY = useSpring(mouseY, { stiffness: 120, damping: 24 });
  const topGlowX = useTransform(glowX, [0, 1], [-20, 24]);
  const topGlowY = useTransform(glowY, [0, 1], [-16, 30]);
  const bottomGlowX = useTransform(glowX, [0, 1], [12, -28]);
  const bottomGlowY = useTransform(glowY, [0, 1], [26, -18]);

  const handlePointer = useEffectEvent((event: MouseEvent) => {
    mouseX.set(event.clientX / window.innerWidth);
    mouseY.set(event.clientY / window.innerHeight);
  });

  useEffect(() => {
    window.addEventListener("mousemove", handlePointer);

    return () => {
      window.removeEventListener("mousemove", handlePointer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-brand-bg)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,182,255,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(0,157,255,0.18),transparent_25%),linear-gradient(180deg,#02060B_0%,#02060B_42%,#07111D_100%)]" />
      <div className="noise-layer pointer-events-none absolute inset-0 opacity-35" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 hidden h-[24rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(18,182,255,0.48)_0%,rgba(18,182,255,0)_72%)] blur-3xl md:block"
        style={{ x: topGlowX, y: topGlowY }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-14 left-[-10rem] hidden h-[20rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(18,182,255,0.24)_0%,rgba(18,182,255,0)_72%)] blur-3xl md:block"
        style={{ x: bottomGlowX, y: bottomGlowY }}
      />

      <div className="relative z-20 border-b border-cyan-300/12 bg-[#06111d]/88 px-4 py-2 text-center text-sm font-medium text-cyan-100 backdrop-blur-xl">
        Pressure washing, trash can cleaning, and curb number painting for Marietta and nearby areas.
      </div>

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#02060B]/80 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="#top" className="min-w-0 transition-transform duration-300 hover:scale-[1.01]">
            <BrandLogo className="origin-left scale-[0.72] sm:scale-90" />
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium uppercase tracking-[0.2em] text-white/72 lg:flex">
            <Link href="#services" className="transition hover:text-cyan-200">
              Services
            </Link>
            <Link href="#areas" className="transition hover:text-cyan-200">
              Areas
            </Link>
            <Link href="#proof" className="transition hover:text-cyan-200">
              Booking Process
            </Link>
            <Link href="#contact" className="transition hover:text-cyan-200">
              Contact
            </Link>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <Button asChild>
              <Link href="/book">Book Online</Link>
            </Button>
          </div>
          <Button asChild size="lg" className="lg:hidden">
            <Link href="/book">Book Online</Link>
          </Button>
        </nav>
      </header>

      <main id="top" className="relative z-10 pb-28 md:pb-0">
        <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-24 lg:pt-16">
          <div>
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-100"
            >
              <Zap className="size-4" />
              Fast scheduling. Clear results.
            </motion.div>
            <motion.h1
              initial="hidden"
              animate="visible"
              custom={0.06}
              variants={fadeUp}
              className="mt-4 max-w-4xl font-heading text-[2.55rem] font-black uppercase leading-[0.92] tracking-[0.03em] text-white sm:mt-5 sm:text-[4.6rem] lg:text-[5.8rem]"
            >
              Pressure Washing And Trash Can Cleaning Made Simple.
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="visible"
              custom={0.12}
              variants={fadeUp}
              className="mt-3 max-w-2xl text-[0.98rem] leading-7 text-slate-200 sm:mt-4 sm:text-xl sm:leading-8"
            >
              Book online, text, or DM. We make it obvious what you need to send, what the service costs, and what happens next so booking feels easy from the first tap.
            </motion.p>
            <motion.p
              initial="hidden"
              animate="visible"
              custom={0.13}
              variants={fadeUp}
              className="mt-2.5 max-w-2xl text-sm leading-6 text-cyan-100/90 sm:mt-3 sm:text-base"
            >
              Fast quotes, clear follow-up, and no guessing about the next step.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={0.15}
              variants={fadeUp}
              className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/92">
                <div className="flex items-center gap-2 text-cyan-200">
                  <CalendarClock className="size-4" />
                  <span className="font-semibold uppercase tracking-[0.16em]">Easy Booking</span>
                </div>
                <p className="mt-2 leading-6 text-slate-300">
                  The form is built to help people book quickly without confusion.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/92">
                <div className="flex items-center gap-2 text-cyan-200">
                  <ShieldCheck className="size-4" />
                  <span className="font-semibold uppercase tracking-[0.16em]">Real Review</span>
                </div>
                <p className="mt-2 leading-6 text-slate-300">
                  A real person reviews each request before the schedule is locked in.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/92">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Lock className="size-4" />
                  <span className="font-semibold uppercase tracking-[0.16em]">Secure Payment</span>
                </div>
                <p className="mt-2 leading-6 text-slate-300">
                  If payment is needed, the site explains it clearly before checkout.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={0.18}
              variants={fadeUp}
              className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row"
            >
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/book">
                  <CalendarClock className="size-4" />
                  Book Online
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href="sms:+16787096690">
                  <MessageSquare className="size-4" />
                  Text Us
                </Link>
              </Button>
            </motion.div>

            <motion.ul
              initial="hidden"
              animate="visible"
              custom={0.24}
              variants={fadeUp}
              className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2"
            >
              {quickFacts.map((fact) => (
                <li
                  key={fact}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white/92"
                >
                  <Check className="mt-0.5 size-5 shrink-0 text-cyan-300" />
                  <span>{fact}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={0.28}
              variants={fadeUp}
              className="mt-5 rounded-[1.4rem] border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100 sm:mt-6 sm:rounded-[1.6rem] sm:px-5"
            >
              The online booking flow helps customers send the right details the first time, see clearer pricing, and feel confident before they commit.
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: premiumEase, delay: 0.18 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[2rem] bg-[linear-gradient(135deg,rgba(18,182,255,0.2),rgba(18,182,255,0),rgba(0,157,255,0.18))] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(8,18,32,0.96),rgba(3,7,12,0.98))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(18,182,255,0.08)_38%,transparent_60%)]" />
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  Why Booking Feels Better Here
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      icon: CalendarClock,
                      title: "A quote form that asks the right things",
                      description:
                        "Customers can send the address, service details, timing, and access notes in one place instead of going back and forth.",
                    },
                    {
                      icon: MapPinned,
                      title: "Service area check before time gets wasted",
                      description:
                        "ZIP-based pricing and range checks help people know early if they are in the service area.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Clear confirmation after booking",
                      description:
                        "The site makes it clear that a real person reviews the request and confirms the final schedule.",
                    },
                  ].map((service) => (
                    <div
                      key={service.title}
                      className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10">
                          <service.icon className="size-6 text-cyan-200" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-heading text-3xl font-black uppercase leading-none text-white">
                              {service.title}
                            </h2>
                          </div>
                          <p className="mt-3 text-base leading-7 text-slate-300">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                      Best next step
                    </p>
                    <p className="mt-2 text-white/92">
                      Book online if you want the smoothest path. Text or DM if you want help first.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                      Good fit for
                    </p>
                    <p className="mt-2 text-white/92">
                      Homeowners, HOAs, busy families, and property managers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="border-y border-white/8 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 text-sm font-semibold uppercase tracking-[0.16em] text-white/88 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {trustItems.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-full border border-white/8 bg-black/20 px-4 py-3"
              >
                <Check className="size-4 text-cyan-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Services"
            title="Three Clear Offers. No Guesswork."
            body="This section is deliberately simple so anyone can scan it fast and understand exactly what CURBSIDE does."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.article
                key={service.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index * 0.08}
                variants={fadeUp}
                className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/28"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10">
                    <service.icon className="size-7 text-cyan-200" />
                  </div>
                  {service.badge ? (
                    <span className="rounded-full border border-cyan-300/18 bg-cyan-400/12 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                      {service.badge}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-6 font-heading text-3xl font-black uppercase leading-none text-white">
                  {service.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-300">{service.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-white/90">
                  {service.items.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(18,182,255,0.8)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#contact"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200 transition group-hover:gap-3"
                >
                  Book Online <ChevronRight className="size-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Why People Book"
            title="Professional Enough To Trust. Simple Enough To Book Fast."
            body="Customers want a service that looks professional and feels easy to understand right away. That is exactly what this experience is built to do."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index * 0.08}
                variants={fadeUp}
                className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <reason.icon className="size-7 text-cyan-200" />
                <h3 className="mt-6 font-heading text-[2rem] font-black uppercase leading-none text-white">
                  {reason.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-300">{reason.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="proof" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Booking Process"
            title="A Booking Experience That Builds Trust"
            body="People are more likely to book when the process feels organized, direct, and easy to understand from the first screen."
            align="center"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {bookingTrustCards.map((item, index) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index * 0.08}
                variants={fadeUp}
              >
                <ProofCard title={item.title} body={item.body} />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Email List"
            title="Stay On The List Without Getting Buried In Emails"
            body="The email list is built for useful reminders and timely offers, not constant blasts. It is meant to stay welcome in the inbox."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <EmailSignupForm />
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                What Subscribers Get
              </p>
              <div className="mt-5 space-y-4 text-sm leading-6 text-white/88">
                <div className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                  Seasonal reminders when exterior cleaning matters most
                </div>
                <div className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                  Simple offers and booking windows when timing is strongest
                </div>
                <div className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                  A low-pressure email rhythm with one-click unsubscribe
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100">
                We email more during spring and early fall, and less during slower parts of the year so the list stays helpful.
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Process"
            title="How It Works"
            body="This flow is written to be obvious at a glance, especially for visitors who want the shortest path from problem to solution."
            align="center"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index * 0.08}
                variants={fadeUp}
                className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="inline-flex size-14 items-center justify-center rounded-full border border-cyan-300/22 bg-cyan-400/10 font-heading text-2xl font-black text-white">
                  {index + 1}
                </div>
                <h3 className="mt-6 font-heading text-3xl font-black uppercase leading-none text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-300">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="areas" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Service Area"
            title="Serving Marietta And Nearby Communities"
            body="Local coverage is now presented more simply so people know right away whether you serve them."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0.04}
              variants={fadeUp}
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,17,29,0.92),rgba(2,6,11,0.98))] p-7"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10">
                  <MapPinned className="size-7 text-cyan-200" />
                </div>
                <div>
                  <h3 className="font-heading text-4xl font-black uppercase leading-none text-white">
                    Areas We Serve
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-300">
                    If you are nearby but don’t see your city listed, send a text and ask.
                  </p>
                </div>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {serviceAreas.map((area) => (
                  <div
                    key={area}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-base text-white/92"
                  >
                    <House className="size-4 text-cyan-200" />
                    {area}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0.12}
              variants={fadeUp}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7"
            >
              <h3 className="font-heading text-4xl font-black uppercase leading-none text-white">
                Best Info To Send For A Fast Quote
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  "Your address or neighborhood",
                  "What needs to be cleaned",
                  "Best day or time for service",
                  "When you want service",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-base text-white/92"
                  >
                    <Check className="mt-0.5 size-5 shrink-0 text-cyan-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions A Visitor May Have Right Away"
            body="This helps reduce hesitation, especially on mobile, where people often want the answer without digging."
          />
          <div className="mt-10 grid gap-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={item.question}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index * 0.06}
                variants={fadeUp}
                className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <h3 className="font-heading text-3xl font-black uppercase leading-none text-white">
                  {item.question}
                </h3>
                <p className="mt-4 max-w-4xl text-base leading-7 text-slate-300">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="contact" className="px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] border border-cyan-300/18 bg-[linear-gradient(120deg,rgba(18,182,255,0.16),rgba(7,17,29,0.98)_28%,rgba(2,6,11,0.98)_62%,rgba(0,157,255,0.16)_100%)] px-6 py-10 shadow-[0_28px_120px_rgba(18,182,255,0.12)] sm:px-8 lg:px-12 lg:py-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  Contact
                </p>
                <h2 className="mt-4 max-w-4xl font-heading text-4xl font-black uppercase leading-[0.92] text-white sm:text-5xl lg:text-6xl">
                  Ready To Clean Up Your Property?
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                  Book online for the smoothest path, or send a text or Instagram DM if you want help first.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/book">
                      <CalendarClock className="size-4" />
                      Book Online
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                    <Link href="sms:+16787096690">
                      <MessageSquare className="size-4" />
                      Text Now
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                    <Link href="https://instagram.com/curbsideexterior" target="_blank" rel="noreferrer">
                      <MessageSquare className="size-4" />
                      DM On Instagram
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6 lg:min-w-[22rem]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Best text or DM to send
                </p>
                <p className="mt-4 text-base leading-7 text-white/92">
                  “Hi, I’m in Marietta. I need a quote for my driveway and front
                  walkway. What would pricing and timing look like?”
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-cyan-300/14 bg-[#02060B]/96 p-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/book">
              <CalendarClock className="size-4" />
              Book Online
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link href="sms:+16787096690">
              <CalendarClock className="size-4" />
              Text Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
