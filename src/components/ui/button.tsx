import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-bold uppercase italic tracking-[0.12em] transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-[#126DFF] bg-[#0B67F0] px-6 py-3 text-white shadow-[0_12px_24px_rgba(0,82,220,0.24)] hover:bg-[#0A5CDF]",
        secondary:
          "border-[#0B67F0] bg-black/35 px-6 py-3 text-white/92 hover:bg-[#0B67F0]/12",
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
