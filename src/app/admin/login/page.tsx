import { LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16 sm:px-6 lg:px-8">
      <form
        action="/api/admin/login"
        method="post"
        className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-[0_18px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="inline-flex size-12 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10 text-cyan-200">
          <LockKeyhole className="size-6" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
          Owner Access
        </p>
        <h1 className="mt-4 font-heading text-4xl font-black uppercase leading-none text-white">
          Admin Login
        </h1>
        <div className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Username</span>
            <input
              name="username"
              defaultValue="ere"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Password</span>
            <input
              name="password"
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300/40"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-cyan-300/80 bg-[linear-gradient(135deg,#12B6FF_0%,#009DFF_55%,#0567D8_100%)] px-6 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_35px_rgba(18,182,255,0.35)] transition hover:-translate-y-0.5"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
