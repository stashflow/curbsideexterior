import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3, LogOut, MessageSquareWarning, PhoneCall } from "lucide-react";

import { getAdminSession } from "@/lib/auth";
import { getAllBookings } from "@/lib/bookings";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const bookings = await getAllBookings();
  const leads = bookings.filter((booking) => ["lead", "pending_payment", "declined_area"].includes(booking.status));
  const upcoming = bookings.filter((booking) => ["pending_confirmation", "confirmed"].includes(booking.status));
  const past = bookings.filter((booking) => ["completed", "cancelled"].includes(booking.status));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Owner Portal
          </p>
          <h1 className="mt-3 font-heading text-5xl font-black uppercase leading-none text-white">
            CURBSIDE Admin
          </h1>
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

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Leads", value: leads.length, icon: MessageSquareWarning },
          { label: "Upcoming", value: upcoming.length, icon: CalendarDays },
          { label: "Completed / Cancelled", value: past.length, icon: CheckCircle2 },
        ].map((card) => (
          <div key={card.label} className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5">
            <card.icon className="size-6 text-cyan-200" />
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-white/60">{card.label}</p>
            <p className="mt-2 font-heading text-5xl font-black text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-heading text-4xl font-black uppercase text-white">New Leads</h2>
        <div className="mt-5 space-y-5">
          {leads.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 text-slate-300">
              No new leads right now.
            </div>
          ) : (
            leads.map((booking) => (
              <article
                key={booking.id}
                className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-heading text-3xl font-black uppercase text-white">
                        {booking.customer_name}
                      </h3>
                      <span className="rounded-full border border-cyan-300/16 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        {booking.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <div className="grid gap-2 text-sm text-white/82 sm:grid-cols-2">
                      <p>{booking.primary_service.replaceAll("_", " ")}</p>
                      <p>{booking.frequency.replaceAll("_", " ")}</p>
                      <p>{booking.city}, {booking.state} {booking.zip}</p>
                      <p>{formatCurrency(booking.quote_total)} total</p>
                      <p>{booking.phone}</p>
                      <p>{booking.email}</p>
                    </div>
                    {booking.notes ? (
                      <p className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-slate-300">
                        {booking.notes}
                      </p>
                    ) : null}
                  </div>
                  <form action="/api/admin/bookings/update" method="post" className="grid gap-3 lg:min-w-[20rem]">
                    <input type="hidden" name="id" value={booking.id} />
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.16em] text-white/60">Status</span>
                      <select
                        name="status"
                        defaultValue={booking.status}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                      >
                        <option value="lead">Lead</option>
                        <option value="pending_confirmation">Pending confirmation</option>
                        <option value="confirmed">Confirmed</option>
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
                      Save Booking
                    </button>
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-4xl font-black uppercase text-white">Upcoming Work</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {upcoming.map((booking) => (
            <div key={booking.id} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <Clock3 className="size-5 text-cyan-200" />
                <p className="font-heading text-2xl font-black uppercase text-white">
                  {booking.customer_name}
                </p>
              </div>
              <p className="mt-3 text-sm text-white/82">
                {booking.scheduled_date ?? booking.preferred_date} - {booking.scheduled_time_window ?? booking.preferred_time_window}
              </p>
              <p className="mt-2 text-sm text-white/82">
                {booking.primary_service.replaceAll("_", " ")} - {formatCurrency(booking.quote_total)}
              </p>
            </div>
          ))}
          {upcoming.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 text-slate-300">
              No upcoming scheduled work yet.
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-4xl font-black uppercase text-white">Past Jobs</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {past.map((booking) => (
            <div key={booking.id} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <PhoneCall className="size-5 text-cyan-200" />
                <p className="font-heading text-2xl font-black uppercase text-white">
                  {booking.customer_name}
                </p>
              </div>
              <p className="mt-3 text-sm text-white/82">
                {booking.primary_service.replaceAll("_", " ")} - {booking.status.replaceAll("_", " ")}
              </p>
            </div>
          ))}
          {past.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 text-slate-300">
              No completed or cancelled jobs yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
