"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  Clock3,
  Droplets,
  House,
  LoaderCircle,
  MapPinned,
  MessageSquare,
  Phone,
  ShieldCheck,
  SprayCan,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BUSINESS_INSTAGRAM_HANDLE,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
} from "@/lib/business";
import { buildQuote, getTimeWindowLabel, type PrimaryService, type PropertyType, type TimeWindow } from "@/lib/pricing";

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
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
      ? `Reserve With ${formatCurrency(quote.depositDue)} Deposit`
      : quote.paymentMode === "full"
        ? `Pay ${formatCurrency(quote.total)} And Book`
        : "Send Request";

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10 text-cyan-200">
              <House className="size-6" />
            </div>
            <div>
              <h1 className="font-heading text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                Book A Service
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Fill this out once and we’ll have everything needed to quote, review,
                and schedule the job quickly. If you prefer, you can still call, text,
                or DM us directly.
              </p>
            </div>
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
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
          <h2 className="font-heading text-3xl font-black uppercase text-white">
            Contact Information
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Full name</span>
              <input
                value={form.customerName}
                onChange={(event) => update("customerName", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Phone</span>
              <input
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                placeholder="678-709-6690"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Instagram handle (optional)</span>
              <input
                value={form.instagramHandle}
                onChange={(event) => update("instagramHandle", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                placeholder="@yourhandle"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
          <h2 className="font-heading text-3xl font-black uppercase text-white">
            Service Request
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                value: "pressure_washing",
                label: "Pressure Washing",
                icon: Droplets,
              },
              {
                value: "trash_can_cleaning",
                label: "Trash Can Cleaning",
                icon: Trash2,
              },
              {
                value: "curb_number_painting",
                label: "Curb Number Painting",
                icon: SprayCan,
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update("primaryService", option.value as PrimaryService)}
                className={`rounded-[1.6rem] border p-5 text-left transition ${
                  form.primaryService === option.value
                    ? "border-cyan-300/40 bg-cyan-400/10"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <option.icon className="size-6 text-cyan-200" />
                <p className="mt-4 font-heading text-2xl font-black uppercase text-white">
                  {option.label}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Property type</span>
              <select
                value={form.propertyType}
                onChange={(event) => update("propertyType", event.target.value as PropertyType)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
              >
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
              <select
                value={form.frequency}
                onChange={(event) => update("frequency", event.target.value as "one_time" | "monthly")}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
              >
                <option value="one_time">One-time service</option>
                <option value="monthly">Monthly service</option>
              </select>
            </label>
          </div>

          {form.primaryService === "pressure_washing" ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Driveway square footage</span>
                <input
                  type="number"
                  min="0"
                  value={form.drivewaySqft}
                  onChange={(event) => update("drivewaySqft", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Walkway square footage</span>
                <input
                  type="number"
                  min="0"
                  value={form.walkwaySqft}
                  onChange={(event) => update("walkwaySqft", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Patio square footage</span>
                <input
                  type="number"
                  min="0"
                  value={form.patioSqft}
                  onChange={(event) => update("patioSqft", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">House square footage</span>
                <input
                  type="number"
                  min="0"
                  value={form.houseSqft}
                  onChange={(event) => update("houseSqft", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Fence linear feet</span>
                <input
                  type="number"
                  min="0"
                  value={form.fenceLinearFeet}
                  onChange={(event) => update("fenceLinearFeet", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Stain level</span>
                <select
                  value={form.heavyStainLevel}
                  onChange={(event) =>
                    update("heavyStainLevel", event.target.value as "light" | "moderate" | "heavy")
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                >
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
                <input
                  type="number"
                  min="1"
                  value={form.binsCount}
                  onChange={(event) => update("binsCount", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Best time after trash pickup</span>
                <select
                  value={form.preferredTimeWindow}
                  onChange={(event) => update("preferredTimeWindow", event.target.value as TimeWindow)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
                >
                  <option value="8-10">8:00 AM - 10:00 AM</option>
                  <option value="10-12">10:00 AM - 12:00 PM</option>
                  <option value="12-2">12:00 PM - 2:00 PM</option>
                  <option value="2-4">2:00 PM - 4:00 PM</option>
                  <option value="4-6">4:00 PM - 6:00 PM</option>
                </select>
              </label>
            </div>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
          <h2 className="font-heading text-3xl font-black uppercase text-white">
            Service Address & Scheduling
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-medium text-slate-200">Street address</span>
              <input
                value={form.addressLine1}
                onChange={(event) => update("addressLine1", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">City</span>
              <input
                value={form.city}
                onChange={(event) => update("city", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">State</span>
              <input
                value={form.state}
                onChange={(event) => update("state", event.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                maxLength={2}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">ZIP code</span>
              <input
                value={form.zip}
                onChange={(event) => update("zip", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                maxLength={5}
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Preferred date</span>
              <input
                type="date"
                value={form.preferredDate}
                onChange={(event) => update("preferredDate", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Preferred time window</span>
              <select
                value={form.preferredTimeWindow}
                onChange={(event) => update("preferredTimeWindow", event.target.value as TimeWindow)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
              >
                <option value="8-10">8:00 AM - 10:00 AM</option>
                <option value="10-12">10:00 AM - 12:00 PM</option>
                <option value="12-2">12:00 PM - 2:00 PM</option>
                <option value="2-4">2:00 PM - 4:00 PM</option>
                <option value="4-6">4:00 PM - 6:00 PM</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
            <input
              type="checkbox"
              checked={form.gateCodeNeeded}
              onChange={(event) => update("gateCodeNeeded", event.target.checked)}
              className="size-4 rounded border-white/20 bg-transparent"
            />
            <span className="text-sm text-white/88">This property has a gate or access code.</span>
          </div>
          {form.gateCodeNeeded ? (
            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium text-slate-200">Gate code / access instructions</span>
              <input
                value={form.gateCode}
                onChange={(event) => update("gateCode", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
              />
            </label>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
          <h2 className="font-heading text-3xl font-black uppercase text-white">
            Extra Details & Consent
          </h2>
          <div className="mt-6 grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Anything we should know?</span>
              <textarea
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                placeholder="Steep driveway, pets in yard, HOA timing limits, odor issue in bins, etc."
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">How did you hear about us?</span>
              <input
                value={form.referralSource}
                onChange={(event) => update("referralSource", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                placeholder="Google, Instagram, neighbor, HOA, yard sign..."
              />
            </label>
          </div>

          <div className="mt-6 space-y-3 rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
            <label className="flex items-start gap-3 text-sm text-white/90">
              <input
                type="checkbox"
                checked={form.smsOptIn}
                onChange={(event) => update("smsOptIn", event.target.checked)}
                className="mt-1 size-4 rounded border-white/20 bg-transparent"
              />
              I agree to receive service-related texts about scheduling, reminders, and job updates.
            </label>
            <label className="flex items-start gap-3 text-sm text-white/90">
              <input
                type="checkbox"
                checked={form.emailOptIn}
                onChange={(event) => update("emailOptIn", event.target.checked)}
                className="mt-1 size-4 rounded border-white/20 bg-transparent"
              />
              I agree to receive quote and service confirmation emails.
            </label>
            <label className="flex items-start gap-3 text-sm text-white/90">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(event) => update("termsAccepted", event.target.checked)}
                className="mt-1 size-4 rounded border-white/20 bg-transparent"
                required
              />
              I agree to the <Link href="/terms" className="text-cyan-200 underline">terms of service</Link>,
              including deposit, cancellation, and surface-condition policies.
            </label>
            <label className="flex items-start gap-3 text-sm text-white/90">
              <input
                type="checkbox"
                checked={form.privacyAccepted}
                onChange={(event) => update("privacyAccepted", event.target.checked)}
                className="mt-1 size-4 rounded border-white/20 bg-transparent"
                required
              />
              I agree to the <Link href="/privacy" className="text-cyan-200 underline">privacy policy</Link>.
            </label>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {bookingButtonLabel}
        </Button>
      </form>

      <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <section className="rounded-[2rem] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(7,17,29,0.95),rgba(2,6,11,0.98))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Live Estimate
          </p>
          <h2 className="mt-4 font-heading text-4xl font-black uppercase leading-none text-white">
            {quote.summary || "Instant service estimate"}
          </h2>
          <div className="mt-6 space-y-3">
            {quote.lineItems.length > 0 ? (
              quote.lineItems.map((item) => (
                <div
                  key={`${item.label}-${item.amount}`}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm font-medium text-white/92">{item.label}</span>
                    <span className="text-sm font-semibold text-cyan-100">
                      {item.amount > 0 ? formatCurrency(item.amount) : "Manual"}
                    </span>
                  </div>
                  {item.note ? (
                    <p className="mt-2 text-xs leading-5 text-slate-400">{item.note}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm text-slate-300">
                Start entering job details to see pricing guidance.
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3 rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center justify-between text-sm text-white/90">
              <span>Estimated total</span>
              <strong>{formatCurrency(quote.total)}</strong>
            </div>
            <div className="flex items-center justify-between text-sm text-white/90">
              <span>Payment today</span>
              <strong>
                {quote.depositDue > 0 ? formatCurrency(quote.depositDue) : "Manual review"}
              </strong>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-cyan-300/16 bg-cyan-400/8 px-4 py-4 text-sm text-cyan-100">
              <MapPinned className="mt-0.5 size-4 shrink-0" />
              <span>{quote.serviceArea.message}</span>
            </div>
            <p className="text-xs leading-5 text-slate-400">{quote.disclaimer}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
            What happens next
          </p>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/88">
            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-cyan-200" />
              We review the request and confirm the preferred time window.
            </div>
            <div className="flex gap-3">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-cyan-200" />
              Pressure washing deposits hold your place on the schedule.
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" />
              Monthly trash can service is manually approved before recurring work begins.
            </div>
            <div className="flex gap-3">
              <Check className="mt-0.5 size-4 shrink-0 text-cyan-200" />
              Weather reschedules are free, and cancellations 24+ hours ahead are fully refundable.
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-slate-300">
            Prefer to book another way? Call <span className="font-semibold text-white">{BUSINESS_PHONE_DISPLAY}</span>
            , text that number, or DM <span className="font-semibold text-white">{BUSINESS_INSTAGRAM_HANDLE}</span>.
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Time Window Preview
          </p>
          <p className="mt-4 text-base text-white/92">
            {form.preferredDate || "Choose a date"}{" "}
            <span className="text-slate-400">
              {form.preferredDate ? `- ${getTimeWindowLabel(form.preferredTimeWindow)}` : ""}
            </span>
          </p>
        </section>
      </aside>
    </div>
  );
}
