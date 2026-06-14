import Link from "next/link";
import { CheckCircle2, MessageSquare, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  BUSINESS_INSTAGRAM_HANDLE,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
} from "@/lib/business";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[2.4rem] border border-cyan-300/18 bg-white/[0.04] p-8 text-center shadow-[0_18px_80px_rgba(0,0,0,0.35)] sm:p-12">
        <CheckCircle2 className="mx-auto size-16 text-cyan-200" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Request Received
        </p>
        <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-none text-white">
          You&apos;re In The Queue
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">
          We received your request and will review it as soon as possible. If payment
          was required, Stripe will confirm that part automatically on the back end.
        </p>
        {params.booking ? (
          <p className="mt-4 text-sm uppercase tracking-[0.18em] text-white/60">
            Booking reference: {params.booking}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
      </div>
    </div>
  );
}
