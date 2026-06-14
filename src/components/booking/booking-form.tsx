"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  LoaderCircle,
  Lock,
  MapPinned,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BUSINESS_INSTAGRAM_HANDLE,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_NAME,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
  PAYMENT_OPERATOR_NAME,
} from "@/lib/business";
import { formatCurrency } from "@/lib/format";
import {
  buildQuote,
  getTimeWindowLabel,
  type PrimaryService,
  type PropertyType,
  type TimeWindow,
} from "@/lib/pricing";

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  instagramHandle: string;
  primaryService: PrimaryService;
  frequency: "one_time" | "monthly";
  propertyType: PropertyType;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  preferredDate: string;
  preferredTimeWindow: TimeWindow;
  drivewaySqft: string;
  walkwaySqft: string;
  patioSqft: string;
  houseSqft: string;
  fenceLinearFeet: string;
  binsCount: string;
  heavyStainLevel: "light" | "moderate" | "heavy";
  gateCodeNeeded: boolean;
  gateCode: string;
  notes: string;
  referralSource: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
};

const initialState: FormState = {
  customerName: "",
  phone: "",
  email: "",
  instagramHandle: "",
  primaryService: "pressure_washing",
  frequency: "one_time",
  propertyType: "single_family",
  addressLine1: "",
  city: "Marietta",
  state: "GA",
  zip: "",
  preferredDate: "",
  preferredTimeWindow: "10-12",
  drivewaySqft: "1000",
  walkwaySqft: "150",
  patioSqft: "0",
  houseSqft: "0",
  fenceLinearFeet: "0",
  binsCount: "2",
  heavyStainLevel: "light",
  gateCodeNeeded: false,
  gateCode: "",
  notes: "",
  referralSource: "",
  smsOptIn: true,
  emailOptIn: true,
  termsAccepted: false,
  privacyAccepted: false,
};

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay },
  }),
};

function SectionCard({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      custom={delay}
      variants={reveal}
      className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7"
    >
      <h2 className="font-heading text-3xl font-black uppercase text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function StepPill({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <div className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/88">
      <span className="font-semibold text-cyan-200">{number}.</span> {title}
    </div>
  );
}

export function BookingForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const quote = useMemo(
    () =>
      buildQuote({
        primaryService: form.primaryService,
        frequency: form.frequency,
        propertyType: form.propertyType,
        zip: form.zip,
        drivewaySqft: Number(form.drivewaySqft || 0),
        walkwaySqft: Number(form.walkwaySqft || 0),
        patioSqft: Number(form.patioSqft || 0),
        houseSqft: Number(form.houseSqft || 0),
        fenceLinearFeet: Number(form.fenceLinearFeet || 0),
        binsCount: Number(form.binsCount || 0),
        gateCodeNeeded: form.gateCodeNeeded,
        heavyStainLevel: form.heavyStainLevel,
      }),
    [form],
  );

  const completion = useMemo(() => {
    const checks = [
      form.customerName,
      form.phone,
      form.email,
      form.addressLine1,
      form.city,
      form.state,
      form.zip,
      form.preferredDate,
      form.preferredTimeWindow,
      form.termsAccepted ? "yes" : "",
      form.privacyAccepted ? "yes" : "",
    ];

    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const response = await fetch("/api/bookings/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      window.location.href = `/book/success?booking=${data.bookingId}`;
    });
  }

  const bookingButtonLabel =
    quote.paymentMode === "deposit"
      ? `Pay ${formatCurrency(quote.depositDue)} Deposit`
      : quote.paymentMode === "full"
        ? `Pay ${formatCurrency(quote.total)}`
        : "Send Request";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <motion.section
            initial="hidden"
            animate="visible"
            custom={0}
            variants={reveal}
            className="overflow-hidden rounded-[2.2rem] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(18,182,255,0.12),rgba(7,17,29,0.98)_28%,rgba(2,6,11,0.98)_100%)] p-6 shadow-[0_18px_80px_rgba(0,0,0,0.35)] sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Book Online
            </p>
            <h1 className="mt-4 max-w-4xl font-heading text-5xl font-black uppercase leading-[0.92] text-white sm:text-6xl">
              Clear pricing. Easy steps. Fast follow-up.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Tell us about the job, see the estimate, and either pay a deposit or send the request.
              We keep the process simple and we do not hide what happens next.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StepPill number={1} title="Tell us about the job" />
              <StepPill number={2} title="See the estimate" />
              <StepPill number={3} title="Pay or send request" />
              <StepPill number={4} title="We confirm the schedule" />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href={`tel:${BUSINESS_PHONE_TEL}`}>
                  <Phone className="size-4" />
                  Call {BUSINESS_PHONE_DISPLAY}
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={BUSINESS_INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  <MessageSquare className="size-4" />
                  DM {BUSINESS_INSTAGRAM_HANDLE}
                </Link>
              </Button>
            </div>
          </motion.section>

          <form onSubmit={handleSubmit} className="space-y-8">
            <SectionCard
              title="Contact Details"
              subtitle="This is how we send the quote, service updates, and confirmation."
              delay={0.05}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Full name</span>
                  <input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Phone</span>
                  <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="678-709-6690" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Email</span>
                  <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Instagram handle (optional)</span>
                  <input value={form.instagramHandle} onChange={(event) => update("instagramHandle", event.target.value)} placeholder="@yourhandle" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" />
                </label>
              </div>
            </SectionCard>

            <SectionCard
              title="Pick The Service"
              subtitle="Choose what you want cleaned. The estimate updates on the right as you fill this out."
              delay={0.1}
            >
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    value: "pressure_washing",
                    label: "Pressure Washing",
                    body: "Driveway, walkway, patio, siding, and fence cleaning.",
                    icon: Droplets,
                  },
                  {
                    value: "trash_can_cleaning",
                    label: "Trash Can Cleaning",
                    body: "One-time cleanings or monthly service requests.",
                    icon: Trash2,
                  },
                  {
                    value: "curb_number_painting",
                    label: "Curb Number Painting",
                    body: "Join the list for this service while it is still coming soon.",
                    icon: SprayCan,
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update("primaryService", option.value as PrimaryService)}
                    className={`rounded-[1.7rem] border p-5 text-left transition ${
                      form.primaryService === option.value
                        ? "border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_40px_rgba(18,182,255,0.08)]"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <option.icon className="size-6 text-cyan-200" />
                    <p className="mt-4 font-heading text-2xl font-black uppercase text-white">
                      {option.label}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{option.body}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Property type</span>
                  <select value={form.propertyType} onChange={(event) => update("propertyType", event.target.value as PropertyType)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40">
                    <option value="single_family">Single-family home</option>
                    <option value="townhome">Townhome</option>
                    <option value="rental">Rental property</option>
                    <option value="hoa">HOA / community</option>
                    <option value="multi_unit">Multi-unit property</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Frequency</span>
                  <select value={form.frequency} onChange={(event) => update("frequency", event.target.value as "one_time" | "monthly")} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40">
                    <option value="one_time">One-time service</option>
                    <option value="monthly">Monthly service</option>
                  </select>
                </label>
              </div>

              {form.primaryService === "pressure_washing" ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ["drivewaySqft", "Driveway square footage"],
                    ["walkwaySqft", "Walkway square footage"],
                    ["patioSqft", "Patio square footage"],
                    ["houseSqft", "House square footage"],
                    ["fenceLinearFeet", "Fence linear feet"],
                  ].map(([key, label]) => (
                    <label key={key} className="space-y-2">
                      <span className="text-sm font-medium text-slate-200">{label}</span>
                      <input
                        type="number"
                        min="0"
                        value={form[key as keyof FormState] as string}
                        onChange={(event) => update(key as keyof FormState, event.target.value as never)}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                      />
                    </label>
                  ))}
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-200">Stain level</span>
                    <select value={form.heavyStainLevel} onChange={(event) => update("heavyStainLevel", event.target.value as "light" | "moderate" | "heavy")} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40">
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="heavy">Heavy / oil / rust</option>
                    </select>
                  </label>
                </div>
              ) : null}

              {form.primaryService === "trash_can_cleaning" ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-200">Number of bins</span>
                    <input type="number" min="1" value={form.binsCount} onChange={(event) => update("binsCount", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40" />
                  </label>
                  <div className="rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100">
                    Monthly trash can cleaning is reviewed by the owner before it is scheduled. You will not be auto-booked.
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Address And Timing"
              subtitle="We use your ZIP code to check service range and any travel fee before you submit."
              delay={0.15}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-200">Street address</span>
                  <input value={form.addressLine1} onChange={(event) => update("addressLine1", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">City</span>
                  <input value={form.city} onChange={(event) => update("city", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">State</span>
                  <input value={form.state} onChange={(event) => update("state", event.target.value.toUpperCase())} maxLength={2} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">ZIP code</span>
                  <input value={form.zip} onChange={(event) => update("zip", event.target.value)} maxLength={5} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Preferred date</span>
                  <input type="date" value={form.preferredDate} onChange={(event) => update("preferredDate", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" required />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Preferred time window</span>
                  <select value={form.preferredTimeWindow} onChange={(event) => update("preferredTimeWindow", event.target.value as TimeWindow)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40">
                    <option value="8-10">8:00 AM - 10:00 AM</option>
                    <option value="10-12">10:00 AM - 12:00 PM</option>
                    <option value="12-2">12:00 PM - 2:00 PM</option>
                    <option value="2-4">2:00 PM - 4:00 PM</option>
                    <option value="4-6">4:00 PM - 6:00 PM</option>
                  </select>
                </label>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                <input type="checkbox" checked={form.gateCodeNeeded} onChange={(event) => update("gateCodeNeeded", event.target.checked)} className="size-4 rounded border-white/20 bg-transparent" />
                <span className="text-sm text-white/88">This property has a gate or needs special access instructions.</span>
              </div>
              {form.gateCodeNeeded ? (
                <label className="mt-4 block space-y-2">
                  <span className="text-sm font-medium text-slate-200">Gate code / access instructions</span>
                  <input value={form.gateCode} onChange={(event) => update("gateCode", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" />
                </label>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Extra Notes And Approval"
              subtitle="We only ask for what helps us quote well, schedule well, and avoid mistakes."
              delay={0.2}
            >
              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Anything we should know?</span>
                  <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" placeholder="Steep driveway, HOA timing limits, pets in yard, strong bin odor, or anything else that helps." />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">How did you hear about us?</span>
                  <input value={form.referralSource} onChange={(event) => update("referralSource", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40" placeholder="Google, Instagram, a neighbor, HOA, a sign, or something else" />
                </label>
              </div>

              <div className="mt-6 space-y-3 rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                <label className="flex items-start gap-3 text-sm leading-6 text-white/90">
                  <input type="checkbox" checked={form.smsOptIn} onChange={(event) => update("smsOptIn", event.target.checked)} className="mt-1 size-4 rounded border-white/20 bg-transparent" />
                  I agree to get service texts about scheduling, reminders, and job updates.
                </label>
                <label className="flex items-start gap-3 text-sm leading-6 text-white/90">
                  <input type="checkbox" checked={form.emailOptIn} onChange={(event) => update("emailOptIn", event.target.checked)} className="mt-1 size-4 rounded border-white/20 bg-transparent" />
                  I agree to get quote and service emails.
                </label>
                <label className="flex items-start gap-3 text-sm leading-6 text-white/90">
                  <input type="checkbox" checked={form.termsAccepted} onChange={(event) => update("termsAccepted", event.target.checked)} className="mt-1 size-4 rounded border-white/20 bg-transparent" required />
                  I agree to the <Link href="/terms" className="text-cyan-200 underline">terms of service</Link>.
                </label>
                <label className="flex items-start gap-3 text-sm leading-6 text-white/90">
                  <input type="checkbox" checked={form.privacyAccepted} onChange={(event) => update("privacyAccepted", event.target.checked)} className="mt-1 size-4 rounded border-white/20 bg-transparent" required />
                  I agree to the <Link href="/privacy" className="text-cyan-200 underline">privacy policy</Link>.
                </label>
              </div>
            </SectionCard>

            {error ? (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <motion.div initial="hidden" animate="visible" custom={0.25} variants={reveal} className="pb-8">
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
                {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {bookingButtonLabel}
              </Button>
            </motion.div>
          </form>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <motion.section
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={reveal}
            className="rounded-[2rem] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(7,17,29,0.95),rgba(2,6,11,0.98))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Your Estimate
                </p>
                <h2 className="mt-3 font-heading text-4xl font-black uppercase leading-none text-white">
                  {quote.summary || "Live pricing"}
                </h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Form done</p>
                <p className="mt-1 text-xl font-semibold text-white">{completion}%</p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#12B6FF,#009DFF)] transition-all duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>

            <div className="mt-6 space-y-3">
              {quote.lineItems.length > 0 ? (
                quote.lineItems.map((item) => (
                  <div key={`${item.label}-${item.amount}`} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm leading-6 text-white/92">{item.label}</span>
                      <span className="text-sm font-semibold text-cyan-100">
                        {item.amount > 0 ? formatCurrency(item.amount) : "Manual"}
                      </span>
                    </div>
                    {item.note ? (
                      <p className="mt-2 text-xs leading-5 text-white/55">{item.note}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-slate-300">
                  Pick a service and fill in the job details to see the estimate update.
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3 rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
              <div className="flex items-center justify-between text-sm text-white/88">
                <span>Estimated total</span>
                <strong>{formatCurrency(quote.total)}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-white/88">
                <span>Today</span>
                <strong>{quote.depositDue > 0 ? formatCurrency(quote.depositDue) : "Manual review"}</strong>
              </div>
              <div className="rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100">
                <div className="flex gap-3">
                  <MapPinned className="mt-0.5 size-4 shrink-0" />
                  <span>{quote.serviceArea.message}</span>
                </div>
              </div>
              <p className="text-xs leading-5 text-slate-400">{quote.disclaimer}</p>
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            animate="visible"
            custom={0.15}
            variants={reveal}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Why people trust this process
            </p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-white/88">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                Clear pricing and clear next steps
              </div>
              <div className="flex gap-3">
                <Lock className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                Secure checkout through Stripe when payment is needed
              </div>
              <div className="flex gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                Fast follow-up from a real person
              </div>
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                No fake photo proof or confusing sales language
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm leading-6 text-cyan-100">
              If Stripe asks for payment, it may show <strong>{PAYMENT_OPERATOR_NAME}</strong>. That is
              the software company that securely handles online payments for {BUSINESS_NAME}.
            </div>
          </motion.section>

          <motion.section
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={reveal}
            className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              What happens after you submit
            </p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-white/88">
              <div className="flex gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                We review the request details
              </div>
              <div className="flex gap-3">
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                If payment is needed, Stripe handles it safely
              </div>
              <div className="flex gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-cyan-200" />
                We confirm your date and time window
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
              Current time window:{" "}
              <span className="font-semibold text-white">
                {form.preferredDate ? `${form.preferredDate} - ${getTimeWindowLabel(form.preferredTimeWindow)}` : "Choose a date and time"}
              </span>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
