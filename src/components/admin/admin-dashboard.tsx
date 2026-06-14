"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import type { ComponentType } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  LogOut,
  MapPinned,
  MessageSquareWarning,
  QrCode,
  Search,
  ShieldCheck,
} from "lucide-react";
import QRCode from "qrcode";

import type { BookingRecord } from "@/lib/bookings";
import { customerInfoList } from "@/lib/email";
import { formatCurrency, formatTitle, parseQuoteJson } from "@/lib/format";

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
    cancelled: "border-rose-300/20 bg-rose-400/10 text-rose-100",
    declined_area: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  };

  return palette[status] ?? "border-white/10 bg-white/10 text-white";
}

function BookingCard({ booking }: { booking: BookingRecord }) {
  const quote = parseQuoteJson(booking.quote_json);

  return (
    <article className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-3xl font-black uppercase text-white">
              {booking.customer_name}
            </h3>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusPill(booking.status)}`}
            >
              {formatTitle(booking.status)}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Service", value: formatTitle(booking.primary_service) },
              { label: "Frequency", value: formatTitle(booking.frequency) },
              { label: "Total", value: formatCurrency(booking.quote_total) },
              {
                label: "Payment",
                value: booking.stripe_payment_status
                  ? formatTitle(booking.stripe_payment_status)
                  : "Not paid yet",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-white/55">{item.label}</p>
                <p className="mt-2 text-sm font-medium text-white/92">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
                Everything We Know
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {customerInfoList(booking).map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</p>
                    <p className="mt-2 break-words text-sm leading-6 text-white/92">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  Quote Breakdown
                </p>
                <div className="mt-4 space-y-3">
                  {quote?.lineItems?.length ? (
                    quote.lineItems.map((item) => (
                      <div key={`${item.label}-${item.amount}`} className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
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

              <form action="/api/admin/bookings/update" method="post" className="rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
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
      </div>
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
  const [isPending, startTransition] = useTransition();

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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

  return (
    <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
      <div className="flex items-center gap-3">
        <QrCode className="size-5 text-cyan-200" />
        <h2 className="font-heading text-4xl font-black uppercase text-white">Create A Payment Link</h2>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
        Use this when you want to send someone a direct payment request. It creates a Stripe checkout link you can text, email, or show as a QR code.
      </p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-white/60">Customer name</span>
              <input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white" required />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-white/60">Customer email</span>
              <input type="email" value={form.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white" required />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-white/60">What is this for?</span>
              <input value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Example: Driveway and walkway cleaning" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white" required />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-white/60">Amount in dollars</span>
              <input type="number" min="1" value={form.amount} onChange={(event) => update("amount", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white" required />
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
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Ready To Send
          </p>
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
                  onClick={() => navigator.clipboard.writeText(result.url)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                >
                  <Copy className="size-3.5" />
                  Copy Link
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
    </section>
  );
}

export function AdminDashboard({ bookings, username }: { bookings: BookingRecord[]; username: string }) {
  const [query, setQuery] = useState("");

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Owner Portal
            </p>
            <h1 className="mt-3 font-heading text-5xl font-black uppercase leading-none text-white">
              CURBSIDE Admin
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Everything is grouped into three buckets: new leads, scheduled work, and finished jobs.
              Search by name, phone, email, service, city, or ZIP any time.
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
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <SectionCard label="Needs attention" value={leads.length} icon={MessageSquareWarning} />
        <SectionCard label="Upcoming" value={upcoming.length} icon={CalendarDays} />
        <SectionCard label="Finished" value={past.length} icon={CheckCircle2} />
        <SectionCard label="Total shown" value={filtered.length} icon={ShieldCheck} />
      </div>

      <section id="leads" className="mt-12">
        <div className="flex items-center gap-3">
          <MessageSquareWarning className="size-5 text-cyan-200" />
          <h2 className="font-heading text-4xl font-black uppercase text-white">Needs Attention</h2>
        </div>
        <p className="mt-3 text-sm text-slate-300">
          New requests, unpaid jobs, and out-of-area submissions show up here first.
        </p>
        <div className="mt-5 space-y-5">
          {leads.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 text-slate-300">
              Nothing needs attention right now.
            </div>
          ) : (
            leads.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>

      <section id="upcoming" className="mt-12">
        <div className="flex items-center gap-3">
          <Clock3 className="size-5 text-cyan-200" />
          <h2 className="font-heading text-4xl font-black uppercase text-white">Upcoming Work</h2>
        </div>
        <p className="mt-3 text-sm text-slate-300">
          Jobs that are paid, pending confirmation, or already confirmed.
        </p>
        <div className="mt-5 space-y-5">
          {upcoming.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 text-slate-300">
              No upcoming work yet.
            </div>
          ) : (
            upcoming.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>

      <section id="past" className="mt-12">
        <div className="flex items-center gap-3">
          <MapPinned className="size-5 text-cyan-200" />
          <h2 className="font-heading text-4xl font-black uppercase text-white">Past Jobs</h2>
        </div>
        <p className="mt-3 text-sm text-slate-300">
          Completed work and cancelled jobs stay here for reference.
        </p>
        <div className="mt-5 space-y-5">
          {past.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 text-slate-300">
              No past jobs yet.
            </div>
          ) : (
            past.map((booking) => <BookingCard key={booking.id} booking={booking} />)
          )}
        </div>
      </section>

      <InvoiceBuilder />
    </div>
  );
}
