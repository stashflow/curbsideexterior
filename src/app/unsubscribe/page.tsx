import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { unsubscribeSubscriberByToken } from "@/lib/subscribers";

export const metadata: Metadata = {
  title: "Unsubscribe | CURBSIDE EXTERIOR CO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token?.trim();
  const subscriber = token ? await unsubscribeSubscriberByToken(token) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-[2.4rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_18px_80px_rgba(0,0,0,0.35)] sm:p-12">
        <p className="text-sm font-black uppercase italic tracking-[0.24em] text-[#0B67F0]">
          Email Preferences
        </p>
        <h1 className="mt-4 font-heading text-5xl font-black uppercase italic leading-none text-white">
          {subscriber ? "You Are Unsubscribed" : "We Could Not Find That Link"}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">
          {subscriber
            ? `${subscriber.email} will no longer receive CURBSIDE marketing emails.`
            : "That unsubscribe link may be missing or expired."}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">Back To Home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/book">Book Service</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
