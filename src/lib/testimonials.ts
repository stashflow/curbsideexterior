import { revalidatePath } from "next/cache";

import { getSql } from "@/lib/db";

export interface TestimonialRecord {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  rating: number;
  message: string;
  status: string;
  source: string;
}

export async function getAllTestimonials() {
  const sql = getSql();
  if (!sql) return [];

  const result = await sql`
    SELECT * FROM testimonials
    ORDER BY created_at DESC
  `;

  return Array.isArray(result) ? (result as TestimonialRecord[]) : [];
}

export async function createTestimonial(input: {
  customerName: string;
  rating: number;
  message: string;
  source?: string;
}) {
  const sql = getSql();
  if (!sql) return null;

  const result = await sql`
    INSERT INTO testimonials (customer_name, rating, message, source)
    VALUES (
      ${input.customerName},
      ${input.rating},
      ${input.message},
      ${input.source ?? "website"}
    )
    RETURNING *
  `;

  revalidatePath("/admin");
  return ((result as TestimonialRecord[])[0] ?? null);
}
