import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MessageSquare, ShieldCheck } from "lucide-react";

import { PostCheckoutInstallTrigger } from "@/components/site/post-checkout-install-trigger";
import { Button } from "@/components/ui/button";
import {
  BUSINESS_INSTAGRAM_HANDLE,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_NAME,
  PAYMENT_OPERATOR_NAME,
} from "@/lib/business";

export const metadata: Metadata = {
  title: "Request Received | CURBSIDE EXTERIOR CO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <PostCheckoutInstallTrigger />
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2.4rem] border border-[#0B67F0]/18 bg-white/[0.04] p-8 text-center shadow-[0_18px_80px_rgba(0,0,0,0.35)] sm:p-12">
          <CheckCircle2 className="mx-auto size-16 text-[#0B67F0]" />
          <p className="mt-6 text-sm font-black uppercase italic tracking-[0.28em] text-[#0B67F0]">
            Request Received
          </p>
          <h1 className="mt-4 font-heading text-5xl font-black uppercase italic leading-none text-white">
            You&apos;re All Set
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            We received your request. If you paid today, your payment went through safely.
            We will review the details and follow up with a clear confirmation.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Your bank statement or checkout page may show {PAYMENT_OPERATOR_NAME}. That is the payment
            company handling secure online checkout for {BUSINESS_NAME}.
          </p>
          {params.booking ? (
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-white/60">
              Booking reference: {params.booking}
            </p>
          ) : null}
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <Clock3 className="size-5 text-[#0B67F0]" />
              <p className="mt-3 text-sm leading-6 text-white/88">
                We review the request and check the schedule.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <ShieldCheck className="size-5 text-[#0B67F0]" />
              <p className="mt-3 text-sm leading-6 text-white/88">
                We confirm your service date and time window.
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <MessageSquare className="size-5 text-[#0B67F0]" />
              <p className="mt-3 text-sm leading-6 text-white/88">
                If you need to add anything, send a text or DM us any time.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/book">
                <CalendarDays className="size-4" />
                Book Online
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={BUSINESS_INSTAGRAM_URL} target="_blank" rel="noreferrer">
                <MessageSquare className="size-4" />
                DM {BUSINESS_INSTAGRAM_HANDLE}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
