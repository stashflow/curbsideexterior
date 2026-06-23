"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeDollarSign,
  BarChart3,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  ChevronDown,
  Copy,
  CreditCard,
  FlaskConical,
  Fuel,
  LogOut,
  Mail,
  MessageSquareWarning,
  Plus,
  QrCode,
  ReceiptText,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trophy,
  UserRoundCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import QRCode from "qrcode";

import type { MoneyData } from "@/lib/admin-money-shared";
import type { BookingRecord } from "@/lib/bookings";
import { customerInfoList } from "@/lib/email";
import { formatCurrency, formatServiceList, formatTitle, parseQuoteJson } from "@/lib/format";
import {
  formatDateInputValue,
  getNextBookableServiceDate,
  timeWindowOptions,
} from "@/lib/scheduling";
import { getSubscriberCampaignSummary, type SubscriberRecord } from "@/lib/subscribers";
import type { TestimonialRecord } from "@/lib/testimonials";

const SECTION_STORAGE_PREFIX = "curbside-admin-viewed";
type AdminSectionId =
  | "dashboard"
  | "leads"
  | "calendar"
  | "customers"
  | "jobs"
  | "postgame"
  | "employees"
  | "reviews"
  | "referrals"
  | "expenses"
  | "inventory"
  | "subscribers"
  | "testimonials"
  | "invoices"
  | "quote"
  | "settings";

const drivewayGuide = [
  { label: "1-car driveway", sqft: 300, price: "$129", image: "/driveway-size-1-car.png" },
  { label: "2-car driveway", sqft: 600, price: "$132", image: "/driveway-size-2-car.png" },
  { label: "3-car driveway", sqft: 900, price: "$198", image: "/driveway-size-3-car.png" },
  { label: "Long driveway", sqft: 1200, price: "$264", image: "/driveway-size-long.png" },
];

function SectionCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
      <Icon className="size-6 text-[#0B67F0]" />
      <p className="mt-4 text-sm uppercase tracking-[0.18em] text-white/60">{label}</p>
      <p className="mt-2 font-heading text-5xl font-black text-white">{value}</p>
    </div>
  );
}

function statusPill(status: string) {
  const palette: Record<string, string> = {
    lead: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    pending_payment: "border-[#0B67F0]/20 bg-[#0B67F0]/10 text-[#BFD7FF]",
    payment_required: "border-[#0B67F0]/20 bg-[#0B67F0]/10 text-[#BFD7FF]",
    pending_confirmation: "border-[#0B67F0]/20 bg-[#0B67F0]/10 text-[#BFD7FF]",
    reschedule_requested: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    confirmed: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    completed: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    subscribed: "border-[#0B67F0]/20 bg-[#0B67F0]/10 text-[#BFD7FF]",
    unsubscribed: "border-white/12 bg-white/8 text-white/85",
    cancelled: "border-rose-300/20 bg-rose-400/10 text-rose-100",
    declined_area: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  };

  return palette[status] ?? "border-white/10 bg-white/10 text-white";
}

function getSectionStorageKey(sectionId: string) {
  return `${SECTION_STORAGE_PREFIX}:${sectionId}`;
}

function loadViewedSections() {
  if (typeof window === "undefined") return {};

  return {
    leads: JSON.parse(localStorage.getItem(getSectionStorageKey("leads")) ?? "[]"),
    upcoming: JSON.parse(localStorage.getItem(getSectionStorageKey("upcoming")) ?? "[]"),
    past: JSON.parse(localStorage.getItem(getSectionStorageKey("past")) ?? "[]"),
    subscribers: JSON.parse(localStorage.getItem(getSectionStorageKey("subscribers")) ?? "[]"),
    testimonials: JSON.parse(localStorage.getItem(getSectionStorageKey("testimonials")) ?? "[]"),
  } as Record<string, string[]>;
}

function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-rose-300/35 bg-rose-500/90 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-[0_0_18px_rgba(244,63,94,0.45)]">
      {count}
    </span>
  );
}

function formatStableDate(value: unknown, options?: { withTime?: boolean }) {
  if (!value) return "Not set";

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  if (!options?.withTime) {
    return `${month} ${day}, ${year}`;
  }

  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const hours12 = hours24 % 12 || 12;
  const meridiem = hours24 >= 12 ? "PM" : "AM";

  return `${month} ${day}, ${year} at ${hours12}:${minutes} ${meridiem}`;
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-white/92">{value}</p>
    </div>
  );
}

function getAdminNextStep(booking: BookingRecord) {
  const paid = booking.stripe_payment_status === "paid";

  if (booking.status === "lead") return "Review photos, check the quote, then accept, deny, or propose a better time.";
  if (booking.status === "pending_payment") return "Customer started booking. If the quote looks right, accept and resend payment options.";
  if (booking.status === "payment_required") return "Job is accepted. Customer still needs to pay the upfront fee or pay in full.";
  if (booking.status === "reschedule_requested") return "Waiting for the customer to accept your proposed time or choose another.";
  if (booking.status === "pending_confirmation" && paid) return "Payment came through. Confirm the job when the schedule looks right.";
  if (booking.status === "pending_confirmation") return "Customer requested another time. Accept it, reschedule, or deny.";
  if (booking.status === "confirmed") return "Job is confirmed. Mark complete after service.";
  if (booking.status === "completed") return "Job is complete.";
  if (booking.status === "cancelled") return "This job is cancelled or denied.";
  if (booking.status === "declined_area") return "Address may be outside the service area. Deny or manually review.";

  return "Review the booking and choose the next action.";
}

function getDrivewayMatch(squareFeet: number | null) {
  if (!squareFeet) return null;
  return drivewayGuide.reduce((closest, option) => {
    return Math.abs(option.sqft - squareFeet) < Math.abs(closest.sqft - squareFeet) ? option : closest;
  }, drivewayGuide[0]);
}

function DrivewayPricingGuide({ squareFeet }: { squareFeet: number | null }) {
  const match = getDrivewayMatch(squareFeet);

  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
      <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
        Driveway Price Guide
      </p>
      <p className="mt-2 text-xs leading-5 text-white/58">
        Quick sanity check for beginners. Match the photo, then adjust for heavy stains, hills, or extra length.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {drivewayGuide.map((option) => {
          const isMatch = match?.label === option.label;

          return (
            <div
              key={option.label}
              className={`overflow-hidden rounded-2xl border bg-white/[0.03] ${
                isMatch ? "border-[#0B67F0]/60 shadow-[0_0_28px_rgba(11,103,240,0.28)]" : "border-white/8"
              }`}
            >
              <Image
                src={option.image}
                alt={option.label}
                width={260}
                height={150}
                className="h-24 w-full object-contain p-2"
              />
              <div className="border-t border-white/8 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white">{option.label}</p>
                <p className="mt-1 text-xs text-[#BFD7FF]">
                  Suggest: {option.price}
                  {isMatch ? " - closest" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentCoach({ booking }: { booking: BookingRecord }) {
  const paid = booking.stripe_payment_status === "paid";
  const depositDue = booking.deposit_due > 0 ? formatCurrency(booking.deposit_due) : "No upfront fee";
  const total = formatCurrency(booking.quote_total);

  return (
    <div className="rounded-[1.5rem] border border-[#0B67F0]/14 bg-[#0B67F0]/[0.06] p-4">
      <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#BFD7FF]">
        Payment Plan
      </p>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-white/82">
        <p>
          <strong className="text-white">Total:</strong> {total}
        </p>
        <p>
          <strong className="text-white">Upfront fee:</strong> {depositDue}
        </p>
        <p>
          <strong className="text-white">Paid now:</strong> {paid ? "Yes" : "No"}
        </p>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/58">
        When you accept an unpaid job, the customer gets two choices: pay the upfront fee or pay in full.
      </p>
    </div>
  );
}

function BookingCard({ booking, isNew }: { booking: BookingRecord; isNew: boolean }) {
  const quote = parseQuoteJson(booking.quote_json);
  const [isOpen, setIsOpen] = useState(isNew);
  const photoUrls = Array.isArray(booking.photo_urls) ? booking.photo_urls : [];

  const summaryDate =
    booking.scheduled_date || booking.preferred_date
      ? formatStableDate(booking.scheduled_date || booking.preferred_date)
      : "Date not set";

  return (
    <article className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.2)]">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-start gap-4 p-5 text-left sm:p-6"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-2xl font-black uppercase leading-none text-white sm:text-3xl">
              {booking.customer_name}
            </h3>
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusPill(booking.status)}`}
            >
              {formatTitle(booking.status)}
            </span>
            {isNew ? <NotificationBadge count={1} /> : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryPill label="Services" value={formatServiceList(booking.primary_service)} />
            <SummaryPill label="Total" value={formatCurrency(booking.quote_total)} />
            <SummaryPill
              label="Payment"
              value={booking.stripe_payment_status ? formatTitle(booking.stripe_payment_status) : "Not paid yet"}
            />
            <SummaryPill label="When" value={summaryDate} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/62">
            <span className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5">
              {booking.city}, {booking.state} {booking.zip}
            </span>
            <span className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5">
              {booking.phone}
            </span>
            <span className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5">
              {booking.email}
            </span>
          </div>
        </div>
        <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/70">
          <ChevronDown
            className={`size-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-white/8 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
                Everything We Know
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {customerInfoList(booking).map(([label, value]) => {
                  const displayValue =
                    label === "Created" ? formatStableDate(booking.created_at, { withTime: true }) : value;

                  return (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</p>
                      <p className="mt-2 break-words text-sm leading-6 text-white/92">{displayValue}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              {photoUrls.length > 0 ? (
                <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                  <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
                    Customer Photos
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {photoUrls.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03]"
                      >
                        <Image
                          src={url}
                          alt={`Customer upload ${index + 1}`}
                          width={320}
                          height={180}
                          className="h-28 w-full object-cover"
                          unoptimized
                        />
                        <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                          Photo {index + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
                  Quote Breakdown
                </p>
                <div className="mt-4 space-y-3">
                  {quote?.lineItems?.length ? (
                    quote.lineItems.map((item) => (
                      <div
                        key={`${item.label}-${item.amount}`}
                        className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-sm text-white/92">{item.label}</span>
                          <span className="text-sm font-semibold text-[#BFD7FF]">
                            {item.amount > 0 ? formatCurrency(item.amount) : "Manual"}
                          </span>
                        </div>
                        {item.note ? (
                          <p className="mt-2 text-xs leading-5 text-white/55">{item.note}</p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/65">No line items stored for this booking.</p>
                  )}
                </div>
              </div>

              <DrivewayPricingGuide squareFeet={booking.driveway_sqft} />
              <PaymentCoach booking={booking} />

              <form
                action="/api/admin/bookings/update"
                method="post"
                className="rounded-[1.5rem] border border-[#0B67F0]/18 bg-black/20 p-4 shadow-[0_0_45px_rgba(11,103,240,0.12)]"
              >
                <input type="hidden" name="id" value={booking.id} />
                <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
                  Decision Center
                </p>
                <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">What to do next</p>
                  <p className="mt-2 text-sm leading-6 text-white/88">{getAdminNextStep(booking)}</p>
                </div>
                <div className="mt-4 grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-white/60">Schedule date</span>
                      <input
                        type="date"
                        name="scheduledDate"
                        defaultValue={booking.scheduled_date ?? booking.preferred_date ?? ""}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                      />
                      <span className="block text-xs leading-5 text-white/45">Closed Sundays.</span>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-white/60">Time window</span>
                      <select
                        name="scheduledTimeWindow"
                        defaultValue={booking.scheduled_time_window ?? booking.preferred_time_window ?? ""}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                      >
                        {timeWindowOptions.map((window) => (
                          <option key={window} value={window}>
                            {window}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/60">
                      Owner notes for yourself
                    </span>
                    <textarea
                      name="ownerNotes"
                      defaultValue={booking.owner_notes ?? ""}
                      placeholder="Example: Confirmed by text. Needs oil spot pre-treatment."
                      className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                    />
                  </label>
                  <div className="grid gap-2">
                    <button
                      type="submit"
                      name="action"
                      value="accept"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-[#0B67F0]/80 bg-[linear-gradient(135deg,#0B67F0_0%,#075BE6_100%)] px-5 text-sm font-black uppercase italic tracking-[0.18em] text-white"
                    >
                      Accept Job + Send Payment
                    </button>
                    <button
                      type="submit"
                      name="action"
                      value="reschedule"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                    >
                      Propose Reschedule
                    </button>
                    <button
                      type="submit"
                      name="action"
                      value="complete"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-400/10 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100"
                    >
                      Mark Complete
                    </button>
                    <button
                      type="submit"
                      name="action"
                      value="deny"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-rose-300/25 bg-rose-400/10 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-rose-100"
                    >
                      Deny / Cancel Job
                    </button>
                  </div>
                </div>

                <details className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                    Advanced manual edit
                  </summary>
                  <div className="mt-4 grid gap-4">
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-white/60">Status</span>
                      <select
                        name="status"
                        defaultValue={booking.status}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                      >
                        <option value="lead">Lead</option>
                        <option value="pending_payment">Pending payment</option>
                        <option value="payment_required">Payment required</option>
                        <option value="pending_confirmation">Pending confirmation</option>
                        <option value="reschedule_requested">Reschedule requested</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="declined_area">Declined area</option>
                      </select>
                    </label>
                    <button
                      type="submit"
                      name="action"
                      value="save"
                      className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-black/30 px-5 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                    >
                      Save Manual Edit
                    </button>
                  </div>
                </details>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function InvoiceBuilder() {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    description: "",
    amount: "50",
  });
  const [error, setError] = useState("");
  const [result, setResult] = useState<null | {
    url: string;
    id: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    description: string;
    qrCode: string;
  }>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCopied(false);

    startTransition(async () => {
      const response = await fetch("/api/admin/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not create payment link.");
        return;
      }

      const qrCode = await QRCode.toDataURL(data.url, {
        margin: 1,
        width: 220,
        color: {
          dark: "#FFFFFF",
          light: "#00000000",
        },
      });

      setResult({ ...data, qrCode });
    });
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={handleSubmit} className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-white/60">Customer name</span>
            <input
              value={form.customerName}
              onChange={(event) => update("customerName", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-white/60">Customer email</span>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(event) => update("customerEmail", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-white/60">What is this for?</span>
            <input
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Example: Driveway and walkway cleaning"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-white/60">Amount in dollars</span>
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(event) => update("amount", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
              required
            />
          </label>
          {error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#0B67F0]/80 bg-[linear-gradient(135deg,#0B67F0_0%,#075BE6_100%)] px-5 text-sm font-black uppercase italic tracking-[0.18em] text-white"
          >
            {isPending ? "Creating..." : "Create Payment Link"}
          </button>
        </div>
      </form>

      <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
        <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Ready To Send</p>
        {result ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Customer</p>
              <p className="mt-2 text-sm text-white/92">{result.customerName}</p>
              <p className="mt-1 text-sm text-white/60">{result.customerEmail}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Amount</p>
              <p className="mt-2 text-sm font-semibold text-white">{formatCurrency(result.amount)}</p>
              <p className="mt-1 text-sm text-white/60">{result.description}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Payment Link</p>
              <p className="mt-2 break-all text-sm text-[#BFD7FF]">{result.url}</p>
              <button
                type="button"
                onClick={() => handleCopy(result.url)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
              >
                <Copy className="size-3.5" />
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">QR Code</p>
              <div className="mt-4 inline-flex rounded-2xl border border-white/8 bg-[#07111D] p-4">
                <Image
                  src={result.qrCode}
                  alt="Invoice QR code"
                  width={176}
                  height={176}
                  className="size-44"
                  unoptimized
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-slate-300">
            Fill out the form and this panel will show the payment link and QR code right here.
          </div>
        )}
      </div>
    </div>
  );
}

function OwnerQuickQuoteForm() {
  const defaultDate = formatDateInputValue(getNextBookableServiceDate(new Date()));

  return (
    <form
      action="/api/admin/bookings/create"
      method="post"
      className="rounded-[1.6rem] border border-[#0B67F0]/25 bg-black/25 p-5 shadow-[0_0_55px_rgba(11,103,240,0.12)]"
    >
      <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Door-Knock Quote</p>
      <h3 className="mt-3 font-heading text-4xl font-black uppercase italic leading-none text-white">
        Add A Booking Fast
      </h3>
      <p className="mt-2 text-sm leading-6 text-white/62">
        Use this when you are with a homeowner. Enter the basics, give the quote, and follow up later.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Name</span>
          <input name="customerName" required className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Phone</span>
          <input name="phone" required className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Email optional</span>
          <input type="email" name="email" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Address</span>
          <input name="addressLine1" required className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
        </label>
        <input type="hidden" name="city" value="Marietta" />
        <input type="hidden" name="state" value="GA" />
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">ZIP</span>
          <input name="zip" required maxLength={5} defaultValue="30060" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Property</span>
          <select name="propertyType" defaultValue="single_family" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white">
            <option value="single_family">Single-family</option>
            <option value="townhome">Townhome</option>
            <option value="rental">Rental</option>
            <option value="hoa">HOA</option>
            <option value="multi_unit">Multi-unit</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/60">Services</p>
        <label className="flex items-center gap-3 text-sm text-white/88">
          <input type="checkbox" name="services" value="pressure_washing" defaultChecked />
          Pressure washing
        </label>
        <label className="flex items-center gap-3 text-sm text-white/88">
          <input type="checkbox" name="services" value="trash_can_cleaning" />
          Trash can cleaning
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Driveway size</span>
          <select name="drivewaySqft" defaultValue="600" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white">
            <option value="0">No driveway</option>
            <option value="300">1-car</option>
            <option value="600">2-car</option>
            <option value="900">3-car</option>
            <option value="1200">Long</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Walkway</span>
          <select name="walkwaySqft" defaultValue="0" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white">
            <option value="0">No walkway</option>
            <option value="80">Small</option>
            <option value="150">Medium</option>
            <option value="250">Large</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Bins</span>
          <input type="number" name="binsCount" min="0" defaultValue="0" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Stains</span>
          <select name="heavyStainLevel" defaultValue="light" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white">
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="heavy">Heavy</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Date</span>
          <input type="date" name="preferredDate" defaultValue={defaultDate} min={defaultDate} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
          <span className="block text-xs leading-5 text-white/45">Closed Sundays.</span>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Time</span>
          <select name="preferredTimeWindow" defaultValue="10-12" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white">
            {timeWindowOptions.map((window) => (
              <option key={window} value={window}>
                {window}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Quote amount optional</span>
          <input type="number" name="quoteTotal" min="0" placeholder="Leave blank to auto-price" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs uppercase tracking-[0.16em] text-white/60">Notes</span>
          <textarea name="notes" className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" placeholder="Door knocked, homeowner wants driveway, text payment link later." />
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full border border-[#0B67F0]/80 bg-[linear-gradient(135deg,#0B67F0_0%,#075BE6_100%)] px-5 text-sm font-black uppercase italic tracking-[0.18em] text-white"
      >
        Save Quote
      </button>
    </form>
  );
}

function TestimonialsPanel({ testimonials }: { testimonials: TestimonialRecord[] }) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
        <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Customer Proof</p>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Public submissions arrive here as pending. Use the best notes for follow-up, screenshots, and future proof sections.
        </p>
      </div>
      {testimonials.length === 0 ? (
        <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 text-slate-300">
          No testimonials yet. Send customers to /testimonial after a good job.
        </div>
      ) : (
        testimonials.map((testimonial) => (
          <article key={testimonial.id} className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                  {testimonial.customer_name}
                </p>
                <p className="mt-2 text-sm text-[#0B67F0]">{"★".repeat(testimonial.rating)}{"☆".repeat(5 - testimonial.rating)}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusPill(testimonial.status)}`}>
                {formatTitle(testimonial.status)}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/78">{testimonial.message}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/40">
              {formatStableDate(testimonial.created_at, { withTime: true })}
            </p>
          </article>
        ))
      )}
    </div>
  );
}

function HowToGuide() {
  const lessons = [
    ["Daily flow", "Open Jobs first. Handle Needs Attention, then confirm Upcoming Work."],
    ["Door knocking", "Use Field Quote. Get name, phone, address, surface size, and a quote amount. Save it before walking away."],
    ["Payments", "If someone is ready, open Payment Tools and create a payment link or QR code."],
    ["Reschedules", "Use Propose Reschedule from the job card. The customer can accept or pick another time."],
    ["Testimonials", "After a good job, send /testimonial. Keep strong reviews for social proof and SEO."],
  ];

  return (
    <div className="grid gap-4">
      <div className="rounded-[1.8rem] border border-[#0B67F0]/25 bg-[#0B67F0]/10 p-5">
        <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Mini Course</p>
        <h3 className="mt-3 font-heading text-4xl font-black uppercase italic leading-none text-white">
          How To Use This App
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/70">
          The app is built around one idea: capture the customer interaction while it is fresh, then let admin workflows handle follow-up.
        </p>
      </div>
      {lessons.map(([title, body], index) => (
        <article key={title} className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
          <p className="text-xs font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">
            Lesson {index + 1}
          </p>
          <h4 className="mt-2 font-heading text-3xl font-black uppercase italic leading-none text-white">{title}</h4>
          <p className="mt-3 text-sm leading-6 text-white/72">{body}</p>
        </article>
      ))}
    </div>
  );
}

function InteractionMap() {
  const interactions = [
    ["Website booking", "Customer uses /book, uploads photos, picks a time, and gets a live estimate."],
    ["QR code", "Send people to /qr now. It redirects home today and can become a campaign landing page later."],
    ["Door knocking", "Owner uses Field Quote so the homeowner never has to fight the form on the porch."],
    ["Instagram/text photos", "Customer sends photos for a fast quote when forms feel like too much."],
    ["Testimonials", "Happy customer submits name, rating, and message at /testimonial."],
    ["Admin follow-up", "Accept, deny, reschedule, request payment, or mark complete from the app."],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {interactions.map(([title, body]) => (
        <article key={title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
          <h4 className="font-heading text-2xl font-black uppercase italic leading-none text-white">{title}</h4>
          <p className="mt-2 text-sm leading-6 text-white/68">{body}</p>
        </article>
      ))}
    </div>
  );
}

function moneyValue(value: number) {
  return formatCurrency(Math.max(0, Number.isFinite(value) ? value : 0));
}

function dateKey(value: string | null | undefined) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function jobDateKey(booking: BookingRecord) {
  return dateKey(booking.scheduled_date || booking.preferred_date || booking.created_at);
}

function isSameMonth(value: string, reference: Date) {
  return value.startsWith(reference.toISOString().slice(0, 7));
}

function isSameWeek(value: string, reference: Date) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function leadStatus(booking: BookingRecord) {
  if (booking.status === "completed") return "Completed";
  if (booking.status === "confirmed") return "Booked";
  if (["payment_required", "pending_confirmation", "reschedule_requested"].includes(booking.status)) return "Quoted";
  if (booking.status === "pending_payment") return "Contacted";
  if (["cancelled", "declined_area"].includes(booking.status)) return "Lost";
  return "New";
}

function leadSource(booking: BookingRecord) {
  if (booking.referral_source) return booking.referral_source;
  if (booking.instagram_handle) return "Instagram";
  if (booking.photo_urls?.length) return "Photo Estimate";
  if (booking.email_opt_in || booking.sms_opt_in) return "Website";
  return "Admin / Direct";
}

function assignedWorkersFor(booking: BookingRecord, index: number) {
  if (booking.owner_notes?.match(/ruben/i)) return "Ruben";
  if (booking.owner_notes?.match(/nico/i)) return "Nico";
  if (booking.owner_notes?.match(/keifer/i)) return "Keifer";
  if (booking.owner_notes?.match(/eddy/i)) return "Eddy";
  return ["Emerson", "Emerson + Ruben", "Emerson + Nico", "Eddy"][index % 4];
}

function BusinessMetric({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/48">{label}</p>
          <p className="mt-2 font-heading text-4xl font-black uppercase italic leading-none text-white">{value}</p>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#0B67F0]/16 bg-[#0B67F0]/10 text-[#BFD7FF]">
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/54">{subtext}</p>
    </div>
  );
}

function BusinessDashboardPanel({
  bookings,
  testimonials,
  subscribers,
  moneyData,
}: {
  bookings: BookingRecord[];
  testimonials: TestimonialRecord[];
  subscribers: SubscriberRecord[];
  moneyData: MoneyData;
}) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const completed = bookings.filter((booking) => booking.status === "completed");
  const revenueSource = moneyData.postgames.length
    ? moneyData.postgames.map((job) => ({ date: job.jobDate, amount: job.finalCharged }))
    : completed.map((booking) => ({ date: jobDateKey(booking), amount: booking.quote_total }));
  const revenueToday = revenueSource.filter((job) => job.date === today).reduce((sum, job) => sum + job.amount, 0);
  const revenueWeek = revenueSource.filter((job) => isSameWeek(job.date, now)).reduce((sum, job) => sum + job.amount, 0);
  const revenueMonth = revenueSource.filter((job) => isSameMonth(job.date, now)).reduce((sum, job) => sum + job.amount, 0);
  const companyProfit = moneyData.postgames.reduce((sum, job) => sum + job.split.businessProfit, 0);
  const monthlyExpenses = moneyData.expenses
    .filter((expense) => isSameMonth(expense.date, now))
    .reduce((sum, expense) => sum + expense.amount, 0);
  const estimatedProfit = moneyData.postgames.length ? companyProfit - monthlyExpenses : Math.round(revenueMonth * 0.35);
  const activeLeads = bookings.filter((booking) => ["New", "Contacted", "Quoted"].includes(leadStatus(booking))).length;

  const metrics = [
    { label: "Revenue Today", value: moneyValue(revenueToday), subtext: "Completed/postgame jobs dated today.", icon: BadgeDollarSign },
    { label: "Revenue This Week", value: moneyValue(revenueWeek), subtext: "Current week booked or postgame revenue.", icon: BarChart3 },
    { label: "Revenue This Month", value: moneyValue(revenueMonth), subtext: "Month-to-date revenue picture.", icon: CalendarDays },
    { label: "Profit", value: moneyValue(estimatedProfit), subtext: moneyData.postgames.length ? "Postgame profit minus monthly expenses." : "Estimated until postgame records are added.", icon: ShieldCheck },
    { label: "Jobs Completed", value: String(completed.length), subtext: "Bookings marked complete.", icon: BriefcaseBusiness },
    { label: "Reviews", value: String(testimonials.length), subtext: "Testimonials captured in the app.", icon: Star },
    { label: "Leads", value: String(activeLeads), subtext: "New/contacted/quoted opportunities.", icon: MessageSquareWarning },
    { label: "Customers", value: String(new Set(bookings.map((booking) => booking.phone || booking.email)).size), subtext: "Unique contacts from bookings.", icon: Users },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <BusinessMetric key={metric.label} {...metric} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4">
          <p className="text-xs font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Today</p>
          <p className="mt-3 text-sm leading-6 text-white/68">
            {bookings.filter((booking) => jobDateKey(booking) === today).length} jobs on the board. Use Calendar for route order and Jobs for notes/photos.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4">
          <p className="text-xs font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Money</p>
          <p className="mt-3 text-sm leading-6 text-white/68">
            {moneyData.usingDatabase ? "Money records are connected to Neon." : "Money tools are in fallback mode until Neon is configured."}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/22 p-4">
          <p className="text-xs font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Audience</p>
          <p className="mt-3 text-sm leading-6 text-white/68">
            {subscribers.filter((subscriber) => subscriber.status === "subscribed").length} active email subscribers ready for seasonal work.
          </p>
        </div>
      </div>
    </div>
  );
}

function LeadsPanel({ bookings }: { bookings: BookingRecord[] }) {
  const statuses = ["New", "Contacted", "Quoted", "Booked", "Completed", "Lost"];

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {statuses.map((status) => (
          <div key={status} className="rounded-2xl border border-white/10 bg-black/22 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/48">{status}</p>
            <p className="mt-2 font-heading text-4xl font-black italic text-white">
              {bookings.filter((booking) => leadStatus(booking) === status).length}
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        {bookings.slice(0, 18).map((booking) => (
          <article key={booking.id} className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-2xl font-black uppercase italic leading-none text-white">{booking.customer_name}</h3>
                  <span className="rounded-full border border-[#0B67F0]/25 bg-[#0B67F0]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#BFD7FF]">
                    {leadStatus(booking)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  {booking.phone} • {booking.address_line_1}, {booking.city} {booking.zip}
                </p>
              </div>
              <div className="grid gap-2 text-left md:min-w-56">
                <SummaryPill label="Source" value={leadSource(booking)} />
                <SummaryPill label="Quote" value={moneyValue(booking.quote_total)} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CalendarPanel({ bookings }: { bookings: BookingRecord[] }) {
  const upcoming = bookings
    .filter((booking) => !["completed", "cancelled"].includes(booking.status))
    .sort((a, b) => jobDateKey(a).localeCompare(jobDateKey(b)))
    .slice(0, 16);

  return (
    <div className="grid gap-3">
      {upcoming.length === 0 ? (
        <div className="rounded-[1.4rem] border border-white/10 bg-black/22 p-5 text-sm text-white/62">No upcoming route items yet.</div>
      ) : (
        upcoming.map((booking, index) => (
          <article key={booking.id} className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#0B67F0]/20 bg-[#0B67F0]/10 font-heading text-xl font-black text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="font-heading text-2xl font-black uppercase italic leading-none text-white">{booking.customer_name}</p>
                  <p className="mt-2 text-sm text-white/62">{formatStableDate(jobDateKey(booking))} • {booking.scheduled_time_window || booking.preferred_time_window}</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 md:min-w-[34rem]">
                <SummaryPill label="Worker" value={assignedWorkersFor(booking, index)} />
                <SummaryPill label="Route" value={`${booking.address_line_1}, ${booking.city}`} />
                <SummaryPill label="Status" value={leadStatus(booking)} />
              </div>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

function CustomersPanel({ bookings, testimonials }: { bookings: BookingRecord[]; testimonials: TestimonialRecord[] }) {
  const customers = Array.from(
    bookings.reduce((map, booking) => {
      const key = booking.phone || booking.email || booking.customer_name;
      const current = map.get(key) ?? {
        name: booking.customer_name,
        phone: booking.phone,
        email: booking.email,
        address: `${booking.address_line_1}, ${booking.city} ${booking.zip}`,
        services: new Set<string>(),
        spent: 0,
        jobs: 0,
        referrals: 0,
      };
      formatServiceList(booking.primary_service).split(", ").forEach((service) => current.services.add(service));
      current.spent += booking.status === "completed" ? booking.quote_total : 0;
      current.jobs += 1;
      current.referrals += booking.referral_source ? 1 : 0;
      map.set(key, current);
      return map;
    }, new Map<string, { name: string; phone: string; email: string; address: string; services: Set<string>; spent: number; jobs: number; referrals: number }>()),
  ).sort((a, b) => b[1].spent - a[1].spent);

  return (
    <div className="grid gap-3">
      {customers.slice(0, 18).map(([key, customer]) => (
        <article key={key} className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="font-heading text-2xl font-black uppercase italic leading-none text-white">{customer.name}</p>
              <p className="mt-2 text-sm leading-6 text-white/62">{customer.phone} • {customer.email}</p>
              <p className="text-sm leading-6 text-white/62">{customer.address}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <SummaryPill label="Services" value={Array.from(customer.services).join(", ") || "None"} />
              <SummaryPill label="Lifetime" value={moneyValue(customer.spent)} />
              <SummaryPill label="Reviews" value={String(testimonials.filter((item) => item.customer_name === customer.name).length)} />
              <SummaryPill label="Referrals" value={String(customer.referrals)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function JobsPanel({ bookings }: { bookings: BookingRecord[] }) {
  return (
    <div className="grid gap-3">
      {bookings.slice(0, 16).map((booking) => (
        <article key={booking.id} className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="font-heading text-2xl font-black uppercase italic leading-none text-white">{booking.customer_name}</p>
              <p className="mt-2 text-sm leading-6 text-white/62">{formatServiceList(booking.primary_service)} • {moneyValue(booking.quote_total)}</p>
              <p className="text-sm leading-6 text-white/62">{booking.notes || booking.owner_notes || "No notes saved yet."}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <SummaryPill label="Photos" value={`${booking.photo_urls?.length ?? 0} saved`} />
              <SummaryPill label="Chemicals" value={booking.heavy_stain_level === "heavy" ? "SH + degreaser" : "SH / surfactant as needed"} />
              <SummaryPill label="Workers" value={assignedWorkersFor(booking, 0)} />
              <SummaryPill label="Before" value={booking.photo_urls?.length ? "Customer photos saved" : "Needed"} />
              <SummaryPill label="After" value={booking.status === "completed" ? "Capture review follow-up" : "Pending"} />
              <SummaryPill label="Status" value={leadStatus(booking)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function PostgamePanel({ moneyData }: { moneyData: MoneyData }) {
  const latest = moneyData.postgames[0];
  const totals = moneyData.postgames.reduce(
    (sum, job) => ({
      revenue: sum.revenue + job.finalCharged,
      expenses: sum.expenses + job.split.directExpenses,
      labor: sum.labor + job.split.laborPool,
      profit: sum.profit + job.split.businessProfit,
    }),
    { revenue: 0, expenses: 0, labor: 0, profit: 0 },
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[1.6rem] border border-[#0B67F0]/22 bg-[#0B67F0]/10 p-5">
        <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#BFD7FF]">Most Important</p>
        <h3 className="mt-3 font-heading text-4xl font-black uppercase italic leading-none text-white">Postgame</h3>
        <p className="mt-3 text-sm leading-6 text-white/68">
          After every job, enter job amount, chemicals, gas, misc expenses, and workers. The system calculates revenue, expenses, labor pool, company profit, and suggested payouts.
        </p>
        <Link href="/admin/postgame" className="mt-5 inline-flex h-12 items-center justify-center rounded-full border border-[#0B67F0]/70 bg-[#0B67F0] px-5 text-sm font-black uppercase italic tracking-[0.14em] text-white">
          Open Postgame
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <BusinessMetric label="Revenue" value={moneyValue(totals.revenue)} subtext="Saved postgame revenue." icon={BadgeDollarSign} />
        <BusinessMetric label="Expenses" value={moneyValue(totals.expenses)} subtext="Direct job expenses." icon={ReceiptText} />
        <BusinessMetric label="Labor Pool" value={moneyValue(totals.labor)} subtext="Suggested worker pool." icon={Users} />
        <BusinessMetric label="Company Profit" value={moneyValue(totals.profit)} subtext={latest ? `Latest: ${latest.customerName}` : "Add a postgame to start tracking."} icon={ShieldCheck} />
      </div>
    </div>
  );
}

function EmployeesPanel({ moneyData }: { moneyData: MoneyData }) {
  const names = ["Emerson", "Ruben", "Nico", "Keifer", "Eddy"];
  const rows = names.map((name) => {
    const jobs = moneyData.postgames.filter((job) => job.workers.some((worker) => worker.name.toLowerCase().includes(name.toLowerCase())));
    const pay = jobs.reduce(
      (sum, job) => sum + job.split.workerPayouts.filter((worker) => worker.name.toLowerCase().includes(name.toLowerCase())).reduce((workerSum, worker) => workerSum + worker.finalPay, 0),
      0,
    );
    const revenue = jobs.reduce((sum, job) => sum + job.finalCharged, 0);
    const referrals = jobs.filter((job) => job.notes.toLowerCase().includes("referral")).length;
    return { name, jobs: jobs.length, revenue, pay, reviews: 0, referrals };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => (
        <article key={row.name} className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-[#0B67F0]/20 bg-[#0B67F0]/10 font-heading text-2xl font-black text-white">
                {index + 1}
              </div>
              <div>
                <p className="font-heading text-3xl font-black uppercase italic leading-none text-white">{row.name}</p>
                <p className="mt-1 text-sm text-white/54">Leaderboard</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              <SummaryPill label="Jobs" value={String(row.jobs)} />
              <SummaryPill label="Revenue" value={moneyValue(row.revenue)} />
              <SummaryPill label="Pay" value={moneyValue(row.pay)} />
              <SummaryPill label="Reviews" value={String(row.reviews)} />
              <SummaryPill label="Referrals" value={String(row.referrals)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReviewsPanel({ testimonials }: { testimonials: TestimonialRecord[] }) {
  const placeholderReview: TestimonialRecord = {
    id: "placeholder",
    customer_name: "Next completed job",
    rating: 5,
    message: "Ask for the review before leaving.",
    status: "needed",
    source: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="grid gap-3">
      {(testimonials.length ? testimonials : [placeholderReview]).map((review) => (
        <article key={review.id} className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="font-heading text-2xl font-black uppercase italic leading-none text-white">{review.customer_name}</p>
              <p className="mt-2 text-sm leading-6 text-white/64">{review.message}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <SummaryPill label="Asked?" value={review.status === "needed" ? "Needed" : "Yes"} />
              <SummaryPill label="Left review?" value={review.status === "approved" ? "Yes" : "Pending"} />
              <SummaryPill label="Google link" value="Send after job" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReferralsPanel({ bookings }: { bookings: BookingRecord[] }) {
  const referred = bookings.filter((booking) => booking.referral_source);

  return (
    <div className="grid gap-3">
      {(referred.length ? referred : bookings.slice(0, 4)).map((booking) => (
        <article key={booking.id} className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <SummaryPill label="Who referred" value={booking.referral_source || "Add source"} />
            <SummaryPill label="Who was referred" value={booking.customer_name} />
            <SummaryPill label="Discount used" value={booking.referral_source ? "Review manually" : "No"} />
            <SummaryPill label="Revenue" value={moneyValue(booking.status === "completed" ? booking.quote_total : 0)} />
          </div>
        </article>
      ))}
    </div>
  );
}

function ExpensesPanel({ moneyData }: { moneyData: MoneyData }) {
  const categories = ["Chemicals", "Gas", "Equipment", "Advertising", "Other"];
  const month = new Date();

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {categories.map((category) => (
          <BusinessMetric
            key={category}
            label={category === "Gas" ? "Fuel" : category}
            value={moneyValue(moneyData.expenses.filter((expense) => expense.category === category && isSameMonth(expense.date, month)).reduce((sum, expense) => sum + expense.amount, 0))}
            subtext="Monthly total"
            icon={category === "Chemicals" ? FlaskConical : category === "Gas" ? Fuel : category === "Equipment" ? Wrench : ReceiptText}
          />
        ))}
      </div>
      <Link href="/admin/expenses" className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-black uppercase italic tracking-[0.14em] text-white">
        Open Expense Tracker
      </Link>
    </div>
  );
}

function InventoryPanel() {
  const items = [
    ["SH", "Check before every job day", "Reorder under 5 gal"],
    ["Surfactant", "House wash + soft wash", "Reorder under 1 gal"],
    ["Degreaser", "Oil spots / trash cans", "Reorder under 1 gal"],
    ["Tips", "Surface cleaner + wand", "Keep backups"],
    ["Hoses", "Supply + pressure hose", "Inspect weekly"],
    ["PPE", "Gloves, eye protection, mask", "Restock monthly"],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([name, use, reorder]) => (
        <article key={name} className="rounded-[1.35rem] border border-white/10 bg-black/22 p-4">
          <Boxes className="size-6 text-[#BFD7FF]" />
          <p className="mt-3 font-heading text-3xl font-black uppercase italic leading-none text-white">{name}</p>
          <p className="mt-2 text-sm leading-6 text-white/62">{use}</p>
          <p className="mt-3 rounded-2xl border border-[#0B67F0]/18 bg-[#0B67F0]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#BFD7FF]">{reorder}</p>
        </article>
      ))}
    </div>
  );
}

function SectionPanel({
  id,
  title,
  description,
  icon: Icon,
  count,
  newCount,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  count: number;
  newCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-5 text-left sm:p-6"
      >
        <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#0B67F0]/16 bg-[#0B67F0]/10 text-[#0B67F0]">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-3xl font-black uppercase text-white sm:text-4xl">{title}</h2>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
              {count}
            </span>
            <NotificationBadge count={newCount} />
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
        </div>
        <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/70">
          <ChevronDown className={`size-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>
      {isOpen ? <div className="border-t border-white/8 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">{children}</div> : null}
    </section>
  );
}

export function AdminDashboard({
  bookings,
  subscribers,
  testimonials,
  moneyData,
  username,
}: {
  bookings: BookingRecord[];
  subscribers: SubscriberRecord[];
  testimonials: TestimonialRecord[];
  moneyData: MoneyData;
  username: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSectionId>("dashboard");
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const quickInputRef = useRef<HTMLInputElement>(null);
  const [viewedBySection, setViewedBySection] = useState<Record<string, string[]>>(() => loadViewedSections());

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return bookings;

    return bookings.filter((booking) => {
      const haystack = [
        booking.customer_name,
        booking.phone,
        booking.email,
        booking.instagram_handle ?? "",
        booking.city,
        booking.zip,
        booking.primary_service,
        booking.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [bookings, query]);

  const leads = filtered.filter((booking) =>
    ["lead", "pending_payment", "payment_required", "declined_area"].includes(booking.status),
  );
  const upcoming = filtered.filter((booking) =>
    ["pending_confirmation", "reschedule_requested", "confirmed"].includes(booking.status),
  );
  const past = filtered.filter((booking) => ["completed", "cancelled"].includes(booking.status));
  const customersCount = new Set(filtered.map((booking) => booking.phone || booking.email || booking.customer_name)).size;
  const activeSubscribers = subscribers.filter((subscriber) => subscriber.status === "subscribed");
  const unsubscribedCount = subscribers.filter((subscriber) => subscriber.status === "unsubscribed").length;

  const sectionIds = useMemo(
    () => ({
      leads: leads.map((booking) => booking.id),
      upcoming: upcoming.map((booking) => booking.id),
      past: past.map((booking) => booking.id),
      subscribers: subscribers.map((subscriber) => subscriber.id),
      testimonials: testimonials.map((testimonial) => testimonial.id),
    }),
    [leads, upcoming, past, subscribers, testimonials],
  );

  function getNewCount(sectionId: keyof typeof sectionIds) {
    const viewed = new Set(viewedBySection[sectionId] ?? []);
    return sectionIds[sectionId].filter((id) => !viewed.has(id)).length;
  }

  function markSectionViewed(sectionId: keyof typeof sectionIds) {
    if (typeof window === "undefined") return;

    const ids = sectionIds[sectionId];
    localStorage.setItem(getSectionStorageKey(sectionId), JSON.stringify(ids));
    setViewedBySection((current) => ({ ...current, [sectionId]: ids }));
  }

  function markViewedIfTracked(sectionId: AdminSectionId) {
    if (sectionId in sectionIds) {
      markSectionViewed(sectionId as keyof typeof sectionIds);
    }
  }

  function scrollToSection(sectionId: AdminSectionId) {
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function openSection(sectionId: AdminSectionId, options?: { scroll?: boolean }) {
    setActiveSection(sectionId);
    setQuickOpen(false);
    setQuickQuery("");
    markViewedIfTracked(sectionId);

    if (options?.scroll) {
      scrollToSection(sectionId);
    }
  }

  function toggleSection(sectionId: AdminSectionId) {
    setActiveSection((current) => (current === sectionId ? "dashboard" : sectionId));
    setQuickOpen(false);
    markViewedIfTracked(sectionId);
  }

  const newCounts = {
    leads: getNewCount("leads"),
    upcoming: getNewCount("upcoming"),
    past: getNewCount("past"),
    subscribers: getNewCount("subscribers"),
    testimonials: getNewCount("testimonials"),
  };

  const workspaceCards = [
    { id: "dashboard", label: "Dashboard", count: filtered.length, newCount: 0, icon: BarChart3 },
    { id: "leads", label: "Leads", count: leads.length, newCount: newCounts.leads, icon: MessageSquareWarning },
    { id: "calendar", label: "Calendar", count: upcoming.length, newCount: newCounts.upcoming, icon: CalendarDays },
    { id: "customers", label: "Customers", count: customersCount, newCount: 0, icon: Users },
    { id: "jobs", label: "Jobs", count: filtered.length, newCount: newCounts.past, icon: BriefcaseBusiness },
    { id: "postgame", label: "Postgame", count: moneyData.postgames.length, newCount: 0, icon: Trophy },
    { id: "employees", label: "Employees", count: 5, newCount: 0, icon: UserRoundCheck },
    { id: "reviews", label: "Reviews", count: testimonials.length, newCount: newCounts.testimonials, icon: Star },
    { id: "referrals", label: "Referrals", count: filtered.filter((booking) => booking.referral_source).length, newCount: 0, icon: Route },
    { id: "expenses", label: "Expenses", count: moneyData.expenses.length, newCount: 0, icon: ReceiptText },
    { id: "inventory", label: "Inventory", count: 6, newCount: 0, icon: Boxes },
    { id: "quote", label: "Field Quote", count: 0, newCount: 0, icon: Plus },
    { id: "invoices", label: "Invoices", count: 0, newCount: 0, icon: CreditCard },
    { id: "settings", label: "How-To", count: 0, newCount: 0, icon: Settings },
  ] as const;

  const bottomTabs = [
    { id: "dashboard", label: "Home", icon: BarChart3 },
    { id: "leads", label: "Leads", icon: MessageSquareWarning },
    { id: "calendar", label: "Route", icon: CalendarDays },
    { id: "postgame", label: "Money", icon: Trophy },
  ] as const;

  const quickActions = useMemo(
    () =>
      [
        {
          type: "section",
          id: "dashboard",
          label: "Dashboard",
          description: "Revenue, profit, completed jobs, reviews, leads, customers, and today status.",
          keywords: "dashboard revenue today week month profit jobs completed reviews leads customers",
          icon: BarChart3,
        },
        {
          type: "link",
          href: "/admin/estimator",
          label: "Curbside Estimator",
          description: "Analyze photos and build an exterior cleaning estimate.",
          keywords: "estimate estimator ai photos quote pricing driveway pressure washing",
          icon: Camera,
        },
        {
          type: "section",
          id: "quote",
          label: "Field Quote",
          description: "Create a booking while door knocking or talking in person.",
          keywords: "door quote booking customer porch manual estimate",
          icon: Plus,
        },
        {
          type: "link",
          href: "/admin/grind",
          label: "Grind Board",
          description: "Daily plays, scripts, apartment visits, calls, and site walkthroughs.",
          keywords: "grind sales calls apartments property managers door knocking scripts",
          icon: BookOpen,
        },
        {
          type: "link",
          href: "/admin/postgame",
          label: "Postgame",
          description: "Finish a job, split the money, pay workers, and save history.",
          keywords: "postgame job complete money split labor payout profit",
          icon: ShieldCheck,
        },
        {
          type: "link",
          href: "/admin/expenses",
          label: "Expenses",
          description: "Track gas, chemicals, ads, software, reimbursements, and receipts.",
          keywords: "expenses gas chemicals equipment reimburse receipt",
          icon: CreditCard,
        },
        {
          type: "link",
          href: "/admin/money",
          label: "Money Dashboard",
          description: "See revenue, expenses, profit, reserves, and business money history.",
          keywords: "money dashboard profit tax reserve expenses revenue",
          icon: CalendarDays,
        },
        {
          type: "section",
          id: "leads",
          label: "Leads",
          description: "Track name, phone, address, lead source, and status.",
          keywords: "leads new contacted quoted booked completed lost source phone address",
          icon: MessageSquareWarning,
        },
        {
          type: "section",
          id: "calendar",
          label: "Calendar",
          description: "Upcoming jobs, assigned workers, and route order.",
          keywords: "schedule upcoming confirmed calendar work workers route order",
          icon: CalendarDays,
        },
        {
          type: "section",
          id: "customers",
          label: "Customers",
          description: "Customer contact info, address, services, spend, reviews, and referrals.",
          keywords: "customers contact address services lifetime spent reviews referrals",
          icon: Users,
        },
        {
          type: "section",
          id: "jobs",
          label: "Jobs",
          description: "Photos, price, notes, chemicals, workers, before photos, and after photos.",
          keywords: "jobs photos price notes chemicals workers before after",
          icon: BriefcaseBusiness,
        },
        {
          type: "section",
          id: "postgame",
          label: "Postgame",
          description: "Calculate revenue, expenses, labor pool, company profit, and suggested payouts.",
          keywords: "postgame revenue expenses labor pool company profit payouts workers",
          icon: Trophy,
        },
        {
          type: "section",
          id: "employees",
          label: "Employees",
          description: "Leaderboard for Emerson, Ruben, Nico, Keifer, and Eddy.",
          keywords: "employees ruben nico keifer eddy emerson leaderboard pay reviews referrals",
          icon: UserRoundCheck,
        },
        {
          type: "section",
          id: "reviews",
          label: "Reviews",
          description: "Asked, left review, and Google review follow-up.",
          keywords: "reviews asked left google testimonial rating",
          icon: Star,
        },
        {
          type: "section",
          id: "referrals",
          label: "Referrals",
          description: "Who referred, who was referred, discount used, and revenue generated.",
          keywords: "referrals referred discount revenue source",
          icon: Route,
        },
        {
          type: "section",
          id: "expenses",
          label: "Expenses",
          description: "Chemicals, fuel, equipment, marketing, misc, and monthly totals.",
          keywords: "expenses chemicals fuel equipment marketing misc monthly totals",
          icon: ReceiptText,
        },
        {
          type: "section",
          id: "inventory",
          label: "Inventory",
          description: "SH, surfactant, degreaser, tips, hoses, and PPE reorder board.",
          keywords: "inventory sh surfactant degreaser tips hoses ppe reorder",
          icon: Boxes,
        },
        {
          type: "section",
          id: "invoices",
          label: "Payment Link",
          description: "Create a Stripe payment link or QR code.",
          keywords: "payment invoice stripe qr charge money",
          icon: CreditCard,
        },
        {
          type: "section",
          id: "testimonials",
          label: "Testimonials",
          description: "Read customer proof submitted from the testimonial form.",
          keywords: "reviews testimonials rating proof customer",
          icon: Star,
        },
        {
          type: "section",
          id: "subscribers",
          label: "Email List",
          description: "View subscribers and seasonal email status.",
          keywords: "email subscribers list marketing",
          icon: Mail,
        },
        {
          type: "section",
          id: "settings",
          label: "How-To",
          description: "Open training notes and operating rhythm.",
          keywords: "settings help how to guide training",
          icon: BookOpen,
        },
      ] as const,
    [],
  );

  const filteredQuickActions = useMemo(() => {
    const normalized = quickQuery.trim().toLowerCase();
    if (!normalized) return quickActions;

    return quickActions.filter((action) =>
      [action.label, action.description, action.keywords].join(" ").toLowerCase().includes(normalized),
    );
  }, [quickActions, quickQuery]);

  function runQuickAction(action: (typeof quickActions)[number]) {
    if (action.type === "link") {
      setQuickOpen(false);
      setQuickQuery("");
      router.push(action.href);
      return;
    }

    openSection(action.id, { scroll: true });
  }

  useEffect(() => {
    if (!quickOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => quickInputRef.current?.focus(), 80);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setQuickOpen(false);
        setQuickQuery("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [quickOpen]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase italic tracking-[0.24em] text-[#0B67F0]">Owner Portal</p>
            <h1 className="mt-3 font-heading text-4xl font-black uppercase italic leading-none text-white sm:text-5xl">
              CURBSIDE Admin
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Built like an iPhone work app: bottom tabs, one-tap field quotes, reviews, payments, and how-to guidance.
            </p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/8"
            >
              <LogOut className="size-4" />
              Log Out
            </button>
          </form>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.75fr_1.15fr]">
          <div className="rounded-[1.6rem] border border-[#0B67F0]/24 bg-[#0B67F0]/10 p-4 shadow-[0_0_35px_rgba(11,103,240,0.14)]">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#0B67F0]/22 bg-black/24 text-[#BFD7FF]">
                <Camera className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-3xl font-black uppercase italic leading-none text-white">
                  Curbside Estimator
                </p>
                <p className="mt-1 text-sm leading-6 text-white/66">
                  Take photos and generate intelligent pricing recommendations for exterior cleaning jobs.
                </p>
                <Link
                  href="/admin/estimator"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-[#0B67F0]/70 bg-[#0B67F0] px-4 text-xs font-black uppercase italic tracking-[0.14em] text-white transition hover:bg-[#075BE6]"
                >
                  Open Estimator
                </Link>
              </div>
            </div>
          </div>
          <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-white">{username}</p>
          </div>
          <label className="flex items-center gap-3 rounded-[1.6rem] border border-white/8 bg-black/20 px-4 py-4">
            <Search className="size-5 text-[#0B67F0]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, email, city, ZIP, or service"
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>
        </div>

        <div className="grid gap-3 xl:grid-cols-[0.92fr_1.08fr]">
          {[
            {
              label: "Growth",
              tools: [
                { title: "Grind Board", body: "Scripts, apartment visits, property manager calls, and daily sales plays.", href: "/admin/grind", icon: BookOpen },
                { title: "Estimator", body: "Open the photo estimator for driveway, house wash, patio, walkway, fence, and trash can jobs.", href: "/admin/estimator", icon: Camera },
              ],
            },
            {
              label: "Money",
              tools: [
                { title: "Postgame", body: "Close out the job, split labor, protect reserves, and save the record.", href: "/admin/postgame", icon: ShieldCheck },
                { title: "Expenses", body: "Track gas, chemicals, ads, software, reimbursements, and receipts.", href: "/admin/expenses", icon: CreditCard },
                { title: "Dashboard", body: "Revenue, profit, reserves, expenses, and job history in one place.", href: "/admin/money", icon: CalendarDays },
              ],
            },
          ].map((group) => (
            <section key={group.label} className="rounded-[1.6rem] border border-white/8 bg-black/18 p-4">
              <p className="text-xs font-black uppercase italic tracking-[0.18em] text-[#0B67F0]">{group.label}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {group.tools.map(({ title, body, href, icon: Icon }) => (
                  <Link
                    key={title}
                    href={href}
                    className="rounded-[1.35rem] border border-white/8 bg-white/[0.035] p-4 transition hover:border-[#0B67F0]/35 hover:bg-[#0B67F0]/10"
                  >
                    <Icon className="size-5 text-[#BFD7FF]" />
                    <p className="mt-3 font-heading text-3xl font-black uppercase italic leading-none text-white">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/58">{body}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="sticky top-3 z-20 -mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-3 px-1">
            {workspaceCards.map(({ id, label, count, newCount, icon: Icon }) => {
              const selected = activeSection === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => openSection(id)}
                  className={`flex min-w-[9rem] items-center justify-between gap-3 rounded-[1.4rem] border px-4 py-3 text-left transition ${
                    selected
                      ? "border-[#0B67F0]/30 bg-[#0B67F0]/12 shadow-[0_0_30px_rgba(11,103,240,0.18)]"
                      : "border-white/8 bg-black/20"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-[#0B67F0]" />
                      <p className="text-xs uppercase tracking-[0.16em] text-white/58">{label}</p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-white">{id === "invoices" ? "Tools" : count}</p>
                  </div>
                  <NotificationBadge count={newCount} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <SectionCard label="Needs attention" value={leads.length} icon={MessageSquareWarning} />
        <SectionCard label="Upcoming" value={upcoming.length} icon={CalendarDays} />
        <SectionCard label="Reviews" value={testimonials.length} icon={Star} />
        <SectionCard label="Total shown" value={filtered.length} icon={ShieldCheck} />
      </div>

      <div className="mt-8 space-y-5">
        <SectionPanel
          id="dashboard"
          title="Dashboard"
          description="Revenue, profit, jobs completed, reviews, leads, and the current business pulse."
          icon={BarChart3}
          count={filtered.length}
          newCount={0}
          isOpen={activeSection === "dashboard"}
          onToggle={() => toggleSection("dashboard")}
        >
          <BusinessDashboardPanel
            bookings={filtered}
            testimonials={testimonials}
            subscribers={subscribers}
            moneyData={moneyData}
          />
        </SectionPanel>

        <SectionPanel
          id="leads"
          title="Leads"
          description="Track name, phone, address, lead source, and status from New through Lost."
          icon={MessageSquareWarning}
          count={filtered.length}
          newCount={newCounts.leads}
          isOpen={activeSection === "leads"}
          onToggle={() => toggleSection("leads")}
        >
          <LeadsPanel bookings={filtered} />
        </SectionPanel>

        <SectionPanel
          id="quote"
          title="Field Quote"
          description="Create a booking yourself when you are door knocking or talking to a customer in person."
          icon={Plus}
          count={1}
          newCount={0}
          isOpen={activeSection === "quote"}
          onToggle={() => toggleSection("quote")}
        >
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <OwnerQuickQuoteForm />
            <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Quote Cheatsheet</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {drivewayGuide.map((option) => (
                  <div key={option.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <Image src={option.image} alt={option.label} width={260} height={150} className="h-24 w-full object-contain" />
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">{option.label}</p>
                    <p className="mt-1 text-xs text-[#BFD7FF]">{option.price}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-white/62">
                Door-knock script: “I can save you the form. I just need your name, phone, address, what you want cleaned, and I’ll text the quote/payment link.”
              </p>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel
          id="calendar"
          title="Calendar"
          description="Upcoming jobs, assigned workers, and route order."
          icon={CalendarDays}
          count={upcoming.length}
          newCount={newCounts.upcoming}
          isOpen={activeSection === "calendar"}
          onToggle={() => toggleSection("calendar")}
        >
          <CalendarPanel bookings={filtered} />
        </SectionPanel>

        <SectionPanel
          id="customers"
          title="Customers"
          description="Contact info, address, services, lifetime spend, reviews, and referral signals."
          icon={Users}
          count={customersCount}
          newCount={0}
          isOpen={activeSection === "customers"}
          onToggle={() => toggleSection("customers")}
        >
          <CustomersPanel bookings={filtered} testimonials={testimonials} />
        </SectionPanel>

        <SectionPanel
          id="jobs"
          title="Jobs"
          description="Photos, price, notes, chemicals used, workers, before photos, and after photos."
          icon={BriefcaseBusiness}
          count={filtered.length}
          newCount={newCounts.past}
          isOpen={activeSection === "jobs"}
          onToggle={() => toggleSection("jobs")}
        >
          <JobsPanel bookings={filtered} />
        </SectionPanel>

        <SectionPanel
          id="postgame"
          title="Postgame"
          description="The closeout flow for job amount, chemicals, gas, misc expenses, workers, profit, and payouts."
          icon={Trophy}
          count={moneyData.postgames.length}
          newCount={0}
          isOpen={activeSection === "postgame"}
          onToggle={() => toggleSection("postgame")}
        >
          <PostgamePanel moneyData={moneyData} />
        </SectionPanel>

        <SectionPanel
          id="employees"
          title="Employees"
          description="Leaderboard for Ruben, Nico, Keifer, Eddy, and Emerson."
          icon={UserRoundCheck}
          count={5}
          newCount={0}
          isOpen={activeSection === "employees"}
          onToggle={() => toggleSection("employees")}
        >
          <EmployeesPanel moneyData={moneyData} />
        </SectionPanel>

        <SectionPanel
          id="reviews"
          title="Reviews"
          description="Track whether a review was asked for, whether it was left, and the Google review follow-up."
          icon={Star}
          count={testimonials.length}
          newCount={newCounts.testimonials}
          isOpen={activeSection === "reviews"}
          onToggle={() => toggleSection("reviews")}
        >
          <ReviewsPanel testimonials={testimonials} />
        </SectionPanel>

        <SectionPanel
          id="referrals"
          title="Referrals"
          description="Who referred, who was referred, discount used, and revenue generated."
          icon={Route}
          count={filtered.filter((booking) => booking.referral_source).length}
          newCount={0}
          isOpen={activeSection === "referrals"}
          onToggle={() => toggleSection("referrals")}
        >
          <ReferralsPanel bookings={filtered} />
        </SectionPanel>

        <SectionPanel
          id="expenses"
          title="Expenses"
          description="Chemicals, fuel, equipment, marketing, misc, and monthly totals."
          icon={ReceiptText}
          count={moneyData.expenses.length}
          newCount={0}
          isOpen={activeSection === "expenses"}
          onToggle={() => toggleSection("expenses")}
        >
          <ExpensesPanel moneyData={moneyData} />
        </SectionPanel>

        <SectionPanel
          id="inventory"
          title="Inventory"
          description="Track SH, surfactant, degreaser, tips, hoses, and PPE so you know when to reorder."
          icon={Boxes}
          count={6}
          newCount={0}
          isOpen={activeSection === "inventory"}
          onToggle={() => toggleSection("inventory")}
        >
          <InventoryPanel />
        </SectionPanel>

        <SectionPanel
          id="subscribers"
          title="Email List"
          description="Subscribers are stored here with their status and next suggested send date."
          icon={Mail}
          count={subscribers.length}
          newCount={newCounts.subscribers}
          isOpen={activeSection === "subscribers"}
          onToggle={() => toggleSection("subscribers")}
        >
          <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-6">
              <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">At A Glance</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/55">Subscribed</p>
                  <p className="mt-2 font-heading text-5xl font-black text-white">{activeSubscribers.length}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/55">Unsubscribed</p>
                  <p className="mt-2 font-heading text-5xl font-black text-white">{unsubscribedCount}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
                  Welcome email goes out right away. After that, the list follows the lighter seasonal cadence already built into the system.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {subscribers.length === 0 ? (
                <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 text-slate-300">
                  No email subscribers yet.
                </div>
              ) : (
                subscribers.map((subscriber) => {
                  const campaign = getSubscriberCampaignSummary(subscriber);
                  const isNew = !(viewedBySection.subscribers ?? []).includes(subscriber.id);

                  return (
                    <div key={subscriber.id} className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-white">{subscriber.email}</p>
                            {isNew ? <NotificationBadge count={1} /> : null}
                          </div>
                          <p className="mt-1 text-sm text-slate-300">
                            {subscriber.first_name || "No name"} {subscriber.zip ? `• ZIP ${subscriber.zip}` : ""}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusPill(subscriber.status)}`}
                        >
                          {formatTitle(subscriber.status)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Joined</p>
                          <p className="mt-2 text-sm text-white/92">{formatStableDate(subscriber.created_at, { withTime: true })}</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Next send</p>
                          <p className="mt-2 text-sm text-white/92">{formatStableDate(campaign.nextDate, { withTime: true })}</p>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Next subject</p>
                          <p className="mt-2 text-sm text-white/92">{campaign.subject}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </SectionPanel>

        <SectionPanel
          id="invoices"
          title="Payment Tools"
          description="Create a payment link you can text, email, or show as a QR code."
          icon={QrCode}
          count={1}
          newCount={0}
          isOpen={activeSection === "invoices"}
          onToggle={() => toggleSection("invoices")}
        >
          <InvoiceBuilder />
        </SectionPanel>

        <SectionPanel
          id="testimonials"
          title="Testimonials"
          description="Customer proof submitted from /testimonial."
          icon={Star}
          count={testimonials.length}
          newCount={newCounts.testimonials}
          isOpen={activeSection === "testimonials"}
          onToggle={() => toggleSection("testimonials")}
        >
          <TestimonialsPanel testimonials={testimonials} />
        </SectionPanel>

        <SectionPanel
          id="settings"
          title="Settings + How-To"
          description="App training, customer interaction map, and operating rhythm."
          icon={Settings}
          count={1}
          newCount={0}
          isOpen={activeSection === "settings"}
          onToggle={() => toggleSection("settings")}
        >
          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <HowToGuide />
            <div className="space-y-5">
              <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Interaction Map</p>
                <h3 className="mt-3 font-heading text-4xl font-black uppercase italic leading-none text-white">
                  Every Way Customers Can Interact
                </h3>
              </div>
              <InteractionMap />
            </div>
          </div>
        </SectionPanel>
      </div>

      <AnimatePresence>
        {quickOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/82 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mx-auto flex h-full max-w-3xl flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-[calc(env(safe-area-inset-top)+1rem)] sm:px-6 sm:pb-8 sm:pt-8"
            >
              <div className="sticky top-0 z-10 rounded-[1.45rem] border border-[#0B67F0]/22 bg-black/80 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#0B67F0]/18 bg-[#0B67F0]/10 text-[#BFD7FF]">
                    <Search className="size-5" />
                  </div>
                  <input
                    ref={quickInputRef}
                    value={quickQuery}
                    onChange={(event) => setQuickQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && filteredQuickActions[0]) {
                        event.preventDefault();
                        runQuickAction(filteredQuickActions[0]);
                      }
                    }}
                    placeholder="Search estimator, jobs, payments, reviews..."
                    className="h-12 min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/35"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setQuickOpen(false);
                      setQuickQuery("");
                    }}
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:text-white"
                    aria-label="Close quick search"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 px-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/42">
                    {filteredQuickActions.length} result{filteredQuickActions.length === 1 ? "" : "s"}
                  </p>
                  <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-white/32 sm:block">
                    Enter opens top result
                  </p>
                </div>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="grid gap-3">
                  {filteredQuickActions.length > 0 ? (
                    filteredQuickActions.map((action, index) => {
                      const Icon = action.icon;

                      return (
                        <motion.button
                          key={action.label}
                          type="button"
                          onClick={() => runQuickAction(action)}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.025, 0.16), duration: 0.16 }}
                          className={`group flex items-center gap-4 rounded-[1.35rem] border p-4 text-left transition ${
                            index === 0
                              ? "border-[#0B67F0]/40 bg-[#0B67F0]/14 shadow-[0_0_38px_rgba(11,103,240,0.18)]"
                              : "border-white/10 bg-white/[0.045] hover:border-[#0B67F0]/35 hover:bg-[#0B67F0]/10"
                          }`}
                        >
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/28 text-[#BFD7FF] transition group-hover:border-[#0B67F0]/30">
                            <Icon className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-white">{action.label}</p>
                              {index === 0 ? (
                                <span className="rounded-full border border-[#0B67F0]/24 bg-[#0B67F0]/12 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.13em] text-[#BFD7FF]">
                                  Top
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/58">{action.description}</p>
                          </div>
                        </motion.button>
                      );
                    })
                  ) : (
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-5 text-sm leading-6 text-white/62">
                      No matching action. Try estimator, payment, jobs, reviews, or schedule.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mobile-app-tabbar z-50 border-t border-white/10 bg-black/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-2 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
          {bottomTabs.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => openSection(id, { scroll: true })}
              className={`rounded-2xl px-2 py-2 text-center ${activeSection === id ? "text-[#0B67F0]" : "text-white/62"}`}
            >
              <Icon className="mx-auto size-5" />
              <span className="mt-1 block text-[10px] font-black uppercase italic tracking-[0.08em]">{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setQuickOpen((current) => !current)}
            className="relative z-10 mx-auto -mt-8 flex size-16 items-center justify-center rounded-full border border-[#126DFF] bg-[#0B67F0] text-white shadow-[0_0_35px_rgba(11,103,240,0.5)]"
            aria-label="Open quick actions"
          >
            <motion.span animate={{ rotate: quickOpen ? 45 : 0 }}>
              <Plus className="size-8" />
            </motion.span>
          </button>
          {bottomTabs.slice(2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => openSection(id, { scroll: true })}
              className={`rounded-2xl px-2 py-2 text-center ${activeSection === id ? "text-[#0B67F0]" : "text-white/62"}`}
            >
              <Icon className="mx-auto size-5" />
              <span className="mt-1 block text-[10px] font-black uppercase italic tracking-[0.08em]">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
