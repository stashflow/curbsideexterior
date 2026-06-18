"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  CreditCard,
  LogOut,
  Mail,
  MapPinned,
  MessageSquareWarning,
  QrCode,
  Search,
  ShieldCheck,
} from "lucide-react";
import QRCode from "qrcode";

import type { BookingRecord } from "@/lib/bookings";
import { customerInfoList } from "@/lib/email";
import { formatCurrency, formatServiceList, formatTitle, parseQuoteJson } from "@/lib/format";
import { getSubscriberCampaignSummary, type SubscriberRecord } from "@/lib/subscribers";

const SECTION_STORAGE_PREFIX = "curbside-admin-viewed";

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
      <Icon className="size-6 text-cyan-200" />
      <p className="mt-4 text-sm uppercase tracking-[0.18em] text-white/60">{label}</p>
      <p className="mt-2 font-heading text-5xl font-black text-white">{value}</p>
    </div>
  );
}

function statusPill(status: string) {
  const palette: Record<string, string> = {
    lead: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    pending_payment: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    pending_confirmation: "border-sky-300/20 bg-sky-400/10 text-sky-100",
    confirmed: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    completed: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    subscribed: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
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
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
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
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
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
                    <p className="text-sm text-white/65">No line items stored for this booking.</p>
                  )}
                </div>
              </div>

              <form
                action="/api/admin/bookings/update"
                method="post"
                className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4"
              >
                <input type="hidden" name="id" value={booking.id} />
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  Update Booking
                </p>
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
                      <option value="pending_confirmation">Pending confirmation</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="declined_area">Declined area</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/60">Scheduled date</span>
                    <input
                      type="date"
                      name="scheduledDate"
                      defaultValue={booking.scheduled_date ?? ""}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/60">Time window</span>
                    <select
                      name="scheduledTimeWindow"
                      defaultValue={booking.scheduled_time_window ?? ""}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                    >
                      <option value="">Not set</option>
                      <option value="8-10">8:00 AM - 10:00 AM</option>
                      <option value="10-12">10:00 AM - 12:00 PM</option>
                      <option value="12-2">12:00 PM - 2:00 PM</option>
                      <option value="2-4">2:00 PM - 4:00 PM</option>
                      <option value="4-6">4:00 PM - 6:00 PM</option>
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/60">Owner notes</span>
                    <textarea
                      name="ownerNotes"
                      defaultValue={booking.owner_notes ?? ""}
                      className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/80 bg-[linear-gradient(135deg,#12B6FF_0%,#009DFF_55%,#0567D8_100%)] px-5 text-sm font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    Save Changes
                  </button>
                </div>
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
            className="inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/80 bg-[linear-gradient(135deg,#12B6FF_0%,#009DFF_55%,#0567D8_100%)] px-5 text-sm font-semibold uppercase tracking-[0.18em] text-white"
          >
            {isPending ? "Creating..." : "Create Payment Link"}
          </button>
        </div>
      </form>

      <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Ready To Send</p>
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
              <p className="mt-2 break-all text-sm text-cyan-100">{result.url}</p>
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
        <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/16 bg-cyan-400/10 text-cyan-200">
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
  username,
}: {
  bookings: BookingRecord[];
  subscribers: SubscriberRecord[];
  username: string;
}) {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("leads");
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

  const leads = filtered.filter((booking) => ["lead", "pending_payment", "declined_area"].includes(booking.status));
  const upcoming = filtered.filter((booking) => ["pending_confirmation", "confirmed"].includes(booking.status));
  const past = filtered.filter((booking) => ["completed", "cancelled"].includes(booking.status));
  const activeSubscribers = subscribers.filter((subscriber) => subscriber.status === "subscribed");
  const unsubscribedCount = subscribers.filter((subscriber) => subscriber.status === "unsubscribed").length;

  const sectionIds = useMemo(
    () => ({
      leads: leads.map((booking) => booking.id),
      upcoming: upcoming.map((booking) => booking.id),
      past: past.map((booking) => booking.id),
      subscribers: subscribers.map((subscriber) => subscriber.id),
    }),
    [leads, upcoming, past, subscribers],
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

  function toggleSection(sectionId: keyof typeof sectionIds | "invoices") {
    setActiveSection((current) => (current === sectionId ? "" : sectionId));
    if (sectionId !== "invoices") {
      markSectionViewed(sectionId);
    }
  }

  const newCounts = {
    leads: getNewCount("leads"),
    upcoming: getNewCount("upcoming"),
    past: getNewCount("past"),
    subscribers: getNewCount("subscribers"),
  };

  const workspaceCards = [
    { id: "leads", label: "Inbox", count: leads.length, newCount: newCounts.leads, icon: MessageSquareWarning },
    { id: "upcoming", label: "Schedule", count: upcoming.length, newCount: newCounts.upcoming, icon: CalendarDays },
    { id: "past", label: "History", count: past.length, newCount: newCounts.past, icon: MapPinned },
    { id: "subscribers", label: "Email", count: subscribers.length, newCount: newCounts.subscribers, icon: Mail },
    { id: "invoices", label: "Invoices", count: 0, newCount: 0, icon: CreditCard },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Owner Portal</p>
            <h1 className="mt-3 font-heading text-4xl font-black uppercase leading-none text-white sm:text-5xl">
              CURBSIDE Admin
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Built like a work app: tap a section, check what is new, open one customer at a time,
              and keep every detail close by without a giant scroll.
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

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-white/55">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-white">{username}</p>
          </div>
          <label className="flex items-center gap-3 rounded-[1.6rem] border border-white/8 bg-black/20 px-4 py-4">
            <Search className="size-5 text-cyan-200" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, email, city, ZIP, or service"
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>
        </div>

        <div className="sticky top-3 z-20 -mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-3 px-1">
            {workspaceCards.map(({ id, label, count, newCount, icon: Icon }) => {
              const selected = activeSection === id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSection(id)}
                  className={`flex min-w-[9rem] items-center justify-between gap-3 rounded-[1.4rem] border px-4 py-3 text-left transition ${
                    selected
                      ? "border-cyan-300/30 bg-cyan-400/12 shadow-[0_0_30px_rgba(18,182,255,0.18)]"
                      : "border-white/8 bg-black/20"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-cyan-200" />
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
        <SectionCard label="Finished" value={past.length} icon={CheckCircle2} />
        <SectionCard label="Total shown" value={filtered.length} icon={ShieldCheck} />
      </div>

      <div className="mt-8 space-y-5">
        <SectionPanel
          id="leads"
          title="Needs Attention"
          description="New requests, unpaid jobs, and out-of-area submissions show up here first."
          icon={MessageSquareWarning}
          count={leads.length}
          newCount={newCounts.leads}
          isOpen={activeSection === "leads"}
          onToggle={() => toggleSection("leads")}
        >
          <div className="space-y-5">
            {leads.length === 0 ? (
              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 text-slate-300">
                Nothing needs attention right now.
              </div>
            ) : (
              leads.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isNew={!(viewedBySection.leads ?? []).includes(booking.id)}
                />
              ))
            )}
          </div>
        </SectionPanel>

        <SectionPanel
          id="upcoming"
          title="Upcoming Work"
          description="Jobs that are paid, pending confirmation, or already confirmed."
          icon={Clock3}
          count={upcoming.length}
          newCount={newCounts.upcoming}
          isOpen={activeSection === "upcoming"}
          onToggle={() => toggleSection("upcoming")}
        >
          <div className="space-y-5">
            {upcoming.length === 0 ? (
              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 text-slate-300">
                No upcoming work yet.
              </div>
            ) : (
              upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isNew={!(viewedBySection.upcoming ?? []).includes(booking.id)}
                />
              ))
            )}
          </div>
        </SectionPanel>

        <SectionPanel
          id="past"
          title="Past Jobs"
          description="Completed work and cancelled jobs stay here for reference."
          icon={MapPinned}
          count={past.length}
          newCount={newCounts.past}
          isOpen={activeSection === "past"}
          onToggle={() => toggleSection("past")}
        >
          <div className="space-y-5">
            {past.length === 0 ? (
              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 text-slate-300">
                No past jobs yet.
              </div>
            ) : (
              past.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isNew={!(viewedBySection.past ?? []).includes(booking.id)}
                />
              ))
            )}
          </div>
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">At A Glance</p>
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
      </div>
    </div>
  );
}
