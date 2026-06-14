export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Legal
        </p>
        <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-none text-white">
          Terms Of Service
        </h1>
        <div className="mt-8 space-y-8 text-base leading-8 text-slate-200">
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">Booking & Estimates</h2>
            <p>
              CURBSIDE EXTERIOR CO. provides estimated pricing based on the information
              submitted by the customer. Final pricing may be adjusted if measurements,
              surface conditions, access limitations, or the actual scope of work differ
              from the submitted request.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">Deposits & Payment</h2>
            <p>
              Pressure washing bookings may require a deposit to reserve scheduling.
              One-time trash can cleaning may require payment in full at checkout.
              Monthly trash can service requests are reviewed manually before recurring work begins.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">Cancellations</h2>
            <p>
              Cancellations made at least 24 hours before the scheduled service time are
              eligible for a full refund of any deposit paid. Cancellations made less
              than 24 hours before service may result in deposit forfeiture. Weather-related
              reschedules do not incur a fee.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">Property Access & Safety</h2>
            <p>
              Customers are responsible for providing safe access to the service area,
              including gates, pets, water access, and any required approvals. CURBSIDE
              EXTERIOR CO. reserves the right to pause, reschedule, or refuse service if
              site conditions are unsafe or materially different from the submitted request.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">Liability Limits</h2>
            <p>
              We take reasonable care while performing services, but we are not responsible
              for pre-existing damage, hidden defects, loose surfaces, deteriorated paint,
              or issues caused by inaccurate customer-provided information.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
