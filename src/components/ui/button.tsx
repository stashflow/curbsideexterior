import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold uppercase tracking-[0.18em] transition-all duration-300 outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-cyan-300/80 bg-[linear-gradient(135deg,#12B6FF_0%,#009DFF_55%,#0567D8_100%)] px-6 py-3 text-white shadow-[0_0_35px_rgba(18,182,255,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(18,182,255,0.55)]",
        secondary:
          "border-white/15 bg-white/5 px-6 py-3 text-white/88 backdrop-blur-md hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10",
        ghost:
          "border-transparent px-4 py-2 text-white/72 hover:bg-white/5 hover:text-white",
      },
      size: {
        default: "h-12",
        lg: "h-14 px-8 text-[0.78rem]",
        icon: "size-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
