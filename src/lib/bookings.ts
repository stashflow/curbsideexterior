import { revalidatePath } from "next/cache";

import { getSql } from "@/lib/db";
import { bookingAdminAlert, sendTransactionalEmail } from "@/lib/email";
import { buildQuote, getTimeWindowLabel } from "@/lib/pricing";
import type { BookingFormValues } from "@/lib/booking-schema";
import { BUSINESS_NAME, BUSINESS_PHONE_DISPLAY, BUSINESS_INSTAGRAM_HANDLE } from "@/lib/business";

export interface BookingRecord {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  phone: string;
  email: string;
  instagram_handle: string | null;
  primary_service: string;
  frequency: string;
  status: string;
  property_type: string;
  address_line_1: string;
  city: string;
  state: string;
  zip: string;
  distance_miles: number | null;
  travel_surcharge: number;
  preferred_date: string;
  preferred_time_window: string;
  scheduled_date: string | null;
  scheduled_time_window: string | null;
  quote_total: number;
  deposit_due: number;
  payment_mode: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_status: string | null;
  heavy_stain_level: string | null;
  bins_count: number | null;
  driveway_sqft: number | null;
  walkway_sqft: number | null;
  patio_sqft: number | null;
  house_sqft: number | null;
  fence_linear_feet: number | null;
  notes: string | null;
  owner_notes: string | null;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  sms_opt_in: boolean;
  email_opt_in: boolean;
  quote_json: string;
}

export async function createBookingSubmission(values: BookingFormValues) {
  const sql = getSql();
  const quote = buildQuote({
    primaryService: values.primaryService,
    frequency: values.frequency,
    propertyType: values.propertyType,
    zip: values.zip,
    drivewaySqft: values.drivewaySqft,
    walkwaySqft: values.walkwaySqft,
    patioSqft: values.patioSqft,
    houseSqft: values.houseSqft,
    fenceLinearFeet: values.fenceLinearFeet,
    binsCount: values.binsCount,
    gateCodeNeeded: values.gateCodeNeeded,
    heavyStainLevel: values.heavyStainLevel,
  });

  const initialStatus = !quote.serviceArea.allowed
    ? "declined_area"
    : quote.paymentMode === "manual_confirmation" || quote.paymentMode === "lead_only"
      ? "lead"
      : "pending_payment";

  if (!sql) {
    return {
      booking: null,
      quote,
      status: initialStatus,
    };
  }

  const result = await sql`
    INSERT INTO bookings (
      customer_name, phone, email, instagram_handle, primary_service, frequency, status,
      property_type, address_line_1, city, state, zip, distance_miles, travel_surcharge,
      preferred_date, preferred_time_window, quote_total, deposit_due, payment_mode,
      heavy_stain_level, bins_count, driveway_sqft, walkway_sqft, patio_sqft, house_sqft,
      fence_linear_feet, notes, terms_accepted, privacy_accepted, sms_opt_in, email_opt_in,
      quote_json
    ) VALUES (
      ${values.customerName},
      ${values.phone},
      ${values.email},
      ${values.instagramHandle || null},
      ${values.primaryService},
      ${values.frequency},
      ${initialStatus},
      ${values.propertyType},
      ${values.addressLine1},
      ${values.city},
      ${values.state},
      ${values.zip},
      ${quote.serviceArea.miles ?? null},
      ${quote.serviceArea.travelSurcharge},
      ${values.preferredDate},
      ${values.preferredTimeWindow},
      ${quote.total},
      ${quote.depositDue},
      ${quote.paymentMode},
      ${values.heavyStainLevel},
      ${values.binsCount || null},
      ${values.drivewaySqft || null},
      ${values.walkwaySqft || null},
      ${values.patioSqft || null},
      ${values.houseSqft || null},
      ${values.fenceLinearFeet || null},
      ${values.notes || null},
      ${values.termsAccepted},
      ${values.privacyAccepted},
      ${values.smsOptIn},
      ${values.emailOptIn},
      ${JSON.stringify(quote)}
    )
    RETURNING *
  `;

  const booking = (result as BookingRecord[])[0];

  try {
    await bookingAdminAlert({
      customerName: booking.customer_name,
      service: booking.primary_service,
      status: booking.status,
    });
  } catch {}

  try {
    await sendTransactionalEmail({
      to: values.email,
      subject: `${BUSINESS_NAME} received your request`,
      html: `<p>Hi ${values.customerName},</p>
        <p>We received your ${values.primaryService.replaceAll("_", " ")} request.</p>
        <p>Preferred time: ${values.preferredDate} (${getTimeWindowLabel(values.preferredTimeWindow)})</p>
        <p>If we need anything else, we will call, text, or email you.</p>
        <p>${BUSINESS_PHONE_DISPLAY} | ${BUSINESS_INSTAGRAM_HANDLE}</p>`,
      text: `Hi ${values.customerName}, we received your request for ${values.primaryService.replaceAll("_", " ")}. Preferred time: ${values.preferredDate} (${getTimeWindowLabel(values.preferredTimeWindow)}).`,
    });
  } catch {}

  return {
    booking,
    quote,
    status: initialStatus,
  };
}

export async function getAllBookings() {
  const sql = getSql();
  if (!sql) return [];

  const result = await sql`
    SELECT * FROM bookings
    ORDER BY created_at DESC
  `;

  return Array.isArray(result) ? (result as BookingRecord[]) : [];
}

export async function updateBookingById(
  id: string,
  updates: {
    status?: string;
    scheduledDate?: string | null;
    scheduledTimeWindow?: string | null;
    ownerNotes?: string | null;
    stripePaymentStatus?: string | null;
    stripeCheckoutSessionId?: string | null;
  },
) {
  const sql = getSql();
  if (!sql) return null;

  const result = await sql`
    UPDATE bookings
    SET
      status = COALESCE(${updates.status ?? null}, status),
      scheduled_date = COALESCE(${updates.scheduledDate ?? null}, scheduled_date),
      scheduled_time_window = COALESCE(${updates.scheduledTimeWindow ?? null}, scheduled_time_window),
      owner_notes = COALESCE(${updates.ownerNotes ?? null}, owner_notes),
      stripe_payment_status = COALESCE(${updates.stripePaymentStatus ?? null}, stripe_payment_status),
      stripe_checkout_session_id = COALESCE(${updates.stripeCheckoutSessionId ?? null}, stripe_checkout_session_id),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  revalidatePath("/admin");
  return ((result as BookingRecord[])[0] ?? null);
}
