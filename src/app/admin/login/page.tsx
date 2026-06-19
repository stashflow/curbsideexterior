import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Login | CURBSIDE EXTERIOR CO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center bg-black px-4 py-16 text-white sm:px-6 lg:px-8">
      <form
        action="/api/admin/login"
        method="post"
        className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_18px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-[#0B67F0]/25 bg-[#0B67F0]/10 text-[#0B67F0]">
          <LockKeyhole className="size-6" />
        </div>
        <p className="mt-6 text-sm font-black uppercase italic tracking-[0.24em] text-[#0B67F0]">
          Owner Access
        </p>
        <h1 className="mt-4 font-heading text-4xl font-black uppercase italic leading-none text-white">
          Admin Login
        </h1>
        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-white/78">Username</span>
            <input
              name="username"
              defaultValue="ere"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-white/78">Password</span>
            <input
              name="password"
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#0B67F0]"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-[#0B67F0]/80 bg-[linear-gradient(135deg,#0B67F0_0%,#075BE6_100%)] px-6 text-sm font-black uppercase italic tracking-[0.18em] text-white shadow-[0_0_35px_rgba(11,103,240,0.35)] transition hover:-translate-y-0.5"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
