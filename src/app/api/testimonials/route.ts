import { NextResponse } from "next/server";
import { z } from "zod";

import { createTestimonial } from "@/lib/testimonials";

export const runtime = "nodejs";

const testimonialSchema = z.object({
  customerName: z.string().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().min(8).max(800),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = testimonialSchema.safeParse({
    customerName: formData.get("customerName"),
    rating: formData.get("rating"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/testimonial?error=invalid", request.url));
  }

  await createTestimonial({
    customerName: parsed.data.customerName,
    rating: parsed.data.rating,
    message: parsed.data.message,
  });

  return NextResponse.redirect(new URL("/testimonial?success=1", request.url));
}
