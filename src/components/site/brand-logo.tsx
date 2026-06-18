import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative inline-flex h-14 w-48 items-center overflow-hidden sm:h-16 sm:w-60",
        className,
      )}
    >
      <Image
        src="/curbside.png"
        alt="CURBSIDE EXTERIOR CO."
        width={1024}
        height={1024}
        priority
        className="absolute left-1/2 top-1/2 size-[13.5rem] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_2px_14px_rgba(255,255,255,0.12)] sm:size-[16rem]"
      />
    </div>
  );
}
