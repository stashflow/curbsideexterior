import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 backdrop-blur-md shadow-[0_0_40px_rgba(18,182,255,0.08)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(18,182,255,0.10),transparent_42%,rgba(18,182,255,0.06))]" />
      <Image
        src="/Logo.png"
        alt="CURBSIDE EXTERIOR CO."
        width={1254}
        height={1254}
        priority
        className="relative h-auto w-[9.5rem] drop-shadow-[0_0_26px_rgba(18,182,255,0.16)] sm:w-[11.25rem]"
      />
    </div>
  );
}
