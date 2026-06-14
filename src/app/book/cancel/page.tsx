import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function BookingCancelPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">
          Checkout Cancelled
        </p>
        <h1 className="mt-4 font-heading text-5xl font-black uppercase leading-none text-white">
          No Problem
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-200">
          Your request is not lost. You can return to booking whenever you&apos;re ready.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/book">Back To Booking</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
