import type { Metadata } from "next";
import Link from "next/link";

import { getBookingByCustomerActionToken } from "@/lib/bookings";
import { formatCurrency, formatDateOnly, formatServiceList } from "@/lib/format";
import { getTimeWindowLabel, type TimeWindow } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Respond To Booking | CURBSIDE EXTERIOR CO.",
  robots: {
    index: false,
    follow: false,
  },
};

const timeWindows: TimeWindow[] = ["8-10", "10-12", "12-2", "2-4", "4-6"];

export default async function BookingResponsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const success = typeof params.success === "string" ? params.success : "";
  const error = typeof params.error === "string" ? params.error : "";
  const booking = token ? await getBookingByCustomerActionToken(token) : null;

  if (success) {
    return (
      <main className="mx-auto flex min-h-[72vh] max-w-xl items-center px-4 py-16">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-white/[0.04] p-7 text-center shadow-[0_0_70px_rgba(11,103,240,0.18)]">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-200">Response Sent</p>
          <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-none text-white">
            Thank You
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            We got your response. If anything else is needed, CURBSIDE will follow up directly.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-cyan-300/80 bg-[linear-gradient(135deg,#12B6FF_0%,#009DFF_55%,#0567D8_100%)] px-6 text-sm font-semibold uppercase tracking-[0.18em] text-white"
          >
            Back Home
          </Link>
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto flex min-h-[72vh] max-w-xl items-center px-4 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-200">Booking Response</p>
          <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-none text-white">
            Link Not Found
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            {error === "expired"
              ? "This response link is no longer available."
              : "Open this page from the link we sent to your email."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-200">Confirm Your Time</p>
        <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-none text-white">
          Does This Work?
        </h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Info label="Service" value={formatServiceList(booking.primary_service)} />
          <Info label="Total" value={formatCurrency(booking.quote_total)} />
          <Info label="Proposed date" value={formatDateOnly(booking.scheduled_date || booking.preferred_date)} />
          <Info label="Proposed time" value={booking.scheduled_time_window || booking.preferred_time_window} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <form action="/api/bookings/respond" method="post">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="action" value="accept" />
            <button className="h-12 w-full rounded-full border border-cyan-300/80 bg-[linear-gradient(135deg,#12B6FF_0%,#009DFF_55%,#0567D8_100%)] px-5 text-sm font-black uppercase tracking-[0.18em] text-white">
              Accept This Time
            </button>
          </form>
          <form action="/api/bookings/respond" method="post">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="action" value="decline" />
            <button className="h-12 w-full rounded-full border border-rose-300/25 bg-rose-400/10 px-5 text-sm font-black uppercase tracking-[0.18em] text-rose-100">
              Cancel Request
            </button>
          </form>
        </div>
      </section>

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-7">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-200">Need Another Time?</p>
        <form action="/api/bookings/respond" method="post" className="mt-4 grid gap-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="action" value="choose_other" />
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-white/60">Preferred date</span>
            <input
              type="date"
              name="preferredDate"
              required
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.16em] text-white/60">Preferred time</span>
            <select
              name="preferredTimeWindow"
              required
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            >
              {timeWindows.map((window) => (
                <option key={window} value={window}>
                  {getTimeWindowLabel(window)}
                </option>
              ))}
            </select>
          </label>
          {error === "pick-time" ? (
            <p className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              Please choose a date and time.
            </p>
          ) : null}
          <button className="h-12 rounded-full border border-white/10 bg-white/[0.06] px-5 text-sm font-black uppercase tracking-[0.18em] text-white">
            Send New Time
          </button>
        </form>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-white/92">{value}</p>
    </div>
  );
}
