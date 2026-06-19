import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth";
import { createOwnerBooking } from "@/lib/bookings";
import type { PrimaryService, PropertyType, TimeWindow } from "@/lib/pricing";

export const runtime = "nodejs";

const ownerBookingSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  services: z.array(z.enum(["pressure_washing", "trash_can_cleaning", "curb_number_painting"])).min(1),
  propertyType: z.enum(["single_family", "townhome", "rental", "hoa", "multi_unit", "other"]),
  addressLine1: z.string().min(3),
  city: z.string().min(2),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
  preferredDate: z.string().min(1),
  preferredTimeWindow: z.enum(["8-10", "10-12", "12-2", "2-4", "4-6"]),
  drivewaySqft: z.coerce.number().min(0).default(0),
  walkwaySqft: z.coerce.number().min(0).default(0),
  patioSqft: z.coerce.number().min(0).default(0),
  houseSqft: z.coerce.number().min(0).default(0),
  fenceLinearFeet: z.coerce.number().min(0).default(0),
  binsCount: z.coerce.number().min(0).default(0),
  heavyStainLevel: z.enum(["light", "moderate", "heavy"]),
  quoteTotal: z.coerce.number().min(0).default(0),
  notes: z.string().max(1000).optional().default(""),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();
  const parsed = ownerBookingSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    services: formData.getAll("services"),
    propertyType: formData.get("propertyType"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    preferredDate: formData.get("preferredDate"),
    preferredTimeWindow: formData.get("preferredTimeWindow"),
    drivewaySqft: formData.get("drivewaySqft") || 0,
    walkwaySqft: formData.get("walkwaySqft") || 0,
    patioSqft: formData.get("patioSqft") || 0,
    houseSqft: formData.get("houseSqft") || 0,
    fenceLinearFeet: formData.get("fenceLinearFeet") || 0,
    binsCount: formData.get("binsCount") || 0,
    heavyStainLevel: formData.get("heavyStainLevel") || "light",
    quoteTotal: formData.get("quoteTotal") || 0,
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/admin?tab=quote&error=owner-booking", request.url));
  }

  await createOwnerBooking({
    ...parsed.data,
    selectedServices: parsed.data.services as PrimaryService[],
    propertyType: parsed.data.propertyType as PropertyType,
    preferredTimeWindow: parsed.data.preferredTimeWindow as TimeWindow,
    email: parsed.data.email || undefined,
  });

  return NextResponse.redirect(new URL("/admin?tab=jobs&created=1", request.url));
}
