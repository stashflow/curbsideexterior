export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Legal
        </p>
        <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-none text-white">
          Privacy Policy
        </h1>
        <div className="mt-8 space-y-8 text-base leading-8 text-slate-200">
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">What We Collect</h2>
            <p>
              We collect the contact, address, scheduling, and service details you submit
              through the website, including your name, phone number, email address,
              service address, service preferences, and notes.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">How We Use It</h2>
            <p>
              We use your information to prepare quotes, schedule service, process payments,
              send confirmations, and communicate about your request. We may also use it to
              improve operations and customer experience.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">Payments & Third Parties</h2>
            <p>
              Online payments are processed through Stripe. Booking and operational data may
              be stored in secure third-party systems used by CURBSIDE EXTERIOR CO., including
              hosting, database, and email providers.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">Texts & Emails</h2>
            <p>
              If you opt in, we may contact you by text or email regarding booking, scheduling,
              reminders, service updates, and occasional seasonal marketing emails. You can
              unsubscribe from non-essential email at any time using the link inside the email
              or by contacting us directly.
            </p>
          </section>
          <section>
            <h2 className="font-heading text-3xl font-black uppercase text-white">Data Requests</h2>
            <p>
              If you need to update or request deletion of your information, contact CURBSIDE
              EXTERIOR CO. directly and we will review the request in line with operational
              and legal obligations.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
