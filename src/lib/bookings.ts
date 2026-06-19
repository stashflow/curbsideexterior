import { revalidatePath } from "next/cache";

import { getSql } from "@/lib/db";
import {
  bookingAdminAlert,
  bookingStatusEmail,
  customerPaymentReceivedEmail,
  customerRequestEmail,
} from "@/lib/email";
import { buildQuote } from "@/lib/pricing";
import type { BookingFormValues } from "@/lib/booking-schema";
import type { PrimaryService, PropertyType, TimeWindow } from "@/lib/pricing";
import { closedDayTimeWindows, isClosedServiceDate } from "@/lib/scheduling";

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
  customer_action_token: string;
  heavy_stain_level: string | null;
  bins_count: number | null;
  gate_code_needed: boolean;
  gate_code: string | null;
  driveway_sqft: number | null;
  walkway_sqft: number | null;
  patio_sqft: number | null;
  house_sqft: number | null;
  fence_linear_feet: number | null;
  photo_urls: string[] | null;
  notes: string | null;
  referral_source: string | null;
  owner_notes: string | null;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  sms_opt_in: boolean;
  email_opt_in: boolean;
  quote_json: unknown;
}

export async function getUnavailablePreferredTimeWindows(preferredDate: string) {
  if (isClosedServiceDate(preferredDate)) {
    return closedDayTimeWindows;
  }

  const sql = getSql();
  if (!sql) return [];

  try {
    const result = await sql`
      SELECT DISTINCT preferred_time_window
      FROM bookings
      WHERE preferred_date = ${preferredDate}
        AND status IN (
          'lead',
          'pending_payment',
          'payment_required',
          'pending_confirmation',
          'reschedule_requested',
          'confirmed'
        )
    `;

    return (Array.isArray(result) ? result : [])
      .map((row) => (row as { preferred_time_window?: string }).preferred_time_window)
      .filter((window): window is TimeWindow =>
        ["8-10", "10-12", "12-2", "2-4", "4-6"].includes(String(window)),
      );
  } catch (error) {
    console.error("Unable to load booked time windows", error);
    return [];
  }
}

export async function isPreferredTimeWindowAvailable(preferredDate: string, preferredTimeWindow: TimeWindow) {
  if (isClosedServiceDate(preferredDate)) {
    return false;
  }

  const unavailable = await getUnavailablePreferredTimeWindows(preferredDate);
  return !unavailable.includes(preferredTimeWindow);
}

export async function createBookingSubmission(values: BookingFormValues) {
  const sql = getSql();
  const quote = buildQuote({
    selectedServices: values.selectedServices,
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

  let result;

  try {
    result = await sql`
      INSERT INTO bookings (
        customer_name, phone, email, instagram_handle, primary_service, frequency, status,
        property_type, address_line_1, city, state, zip, distance_miles, travel_surcharge,
        preferred_date, preferred_time_window, quote_total, deposit_due, payment_mode, customer_action_token,
        heavy_stain_level, bins_count, gate_code_needed, gate_code, driveway_sqft, walkway_sqft,
        patio_sqft, house_sqft, fence_linear_feet, photo_urls, notes, referral_source, terms_accepted,
        privacy_accepted, sms_opt_in, email_opt_in, quote_json
      ) VALUES (
        ${values.customerName},
        ${values.phone},
        ${values.email},
        ${values.instagramHandle || null},
        ${values.selectedServices.join(",")},
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
        ${crypto.randomUUID()},
        ${values.heavyStainLevel},
        ${values.binsCount || null},
        ${values.gateCodeNeeded},
        ${values.gateCode || null},
        ${values.drivewaySqft || null},
        ${values.walkwaySqft || null},
        ${values.patioSqft || null},
        ${values.houseSqft || null},
        ${values.fenceLinearFeet || null},
        ${JSON.stringify(values.photoUrls ?? [])},
        ${values.notes || null},
        ${values.referralSource || null},
        ${values.termsAccepted},
        ${values.privacyAccepted},
        ${values.smsOptIn},
        ${values.emailOptIn},
        ${JSON.stringify(quote)}
      )
      RETURNING *
    `;
  } catch (error) {
    if (!isMissingPhotoUrlsColumnError(error)) {
      throw error;
    }

    console.error("Bookings table is missing photo_urls; retrying booking insert without uploaded photos.", error);

    result = await sql`
    INSERT INTO bookings (
      customer_name, phone, email, instagram_handle, primary_service, frequency, status,
      property_type, address_line_1, city, state, zip, distance_miles, travel_surcharge,
      preferred_date, preferred_time_window, quote_total, deposit_due, payment_mode, customer_action_token,
      heavy_stain_level, bins_count, gate_code_needed, gate_code, driveway_sqft, walkway_sqft,
      patio_sqft, house_sqft, fence_linear_feet, notes, referral_source, terms_accepted,
      privacy_accepted, sms_opt_in, email_opt_in, quote_json
    ) VALUES (
      ${values.customerName},
      ${values.phone},
      ${values.email},
      ${values.instagramHandle || null},
      ${values.selectedServices.join(",")},
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
      ${crypto.randomUUID()},
      ${values.heavyStainLevel},
      ${values.binsCount || null},
      ${values.gateCodeNeeded},
      ${values.gateCode || null},
      ${values.drivewaySqft || null},
      ${values.walkwaySqft || null},
      ${values.patioSqft || null},
      ${values.houseSqft || null},
      ${values.fenceLinearFeet || null},
      ${values.notes || null},
      ${values.referralSource || null},
      ${values.termsAccepted},
      ${values.privacyAccepted},
      ${values.smsOptIn},
      ${values.emailOptIn},
      ${JSON.stringify(quote)}
    )
    RETURNING *
  `;
  }

  const booking = (result as BookingRecord[])[0];

  try {
    await bookingAdminAlert(booking);
  } catch {}

  try {
    await customerRequestEmail(booking);
  } catch {}

  return {
    booking,
    quote,
    status: initialStatus,
  };
}

export async function createOwnerBooking(values: {
  customerName: string;
  phone: string;
  email?: string;
  selectedServices: PrimaryService[];
  propertyType: PropertyType;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  preferredDate: string;
  preferredTimeWindow: TimeWindow;
  drivewaySqft?: number;
  walkwaySqft?: number;
  patioSqft?: number;
  houseSqft?: number;
  fenceLinearFeet?: number;
  binsCount?: number;
  heavyStainLevel?: "light" | "moderate" | "heavy";
  quoteTotal?: number;
  notes?: string;
}) {
  const sql = getSql();
  const quote = buildQuote({
    selectedServices: values.selectedServices,
    frequency: "one_time",
    propertyType: values.propertyType,
    zip: values.zip,
    drivewaySqft: values.drivewaySqft ?? 0,
    walkwaySqft: values.walkwaySqft ?? 0,
    patioSqft: values.patioSqft ?? 0,
    houseSqft: values.houseSqft ?? 0,
    fenceLinearFeet: values.fenceLinearFeet ?? 0,
    binsCount: values.binsCount ?? 0,
    heavyStainLevel: values.heavyStainLevel ?? "light",
  });

  const total = values.quoteTotal && values.quoteTotal > 0 ? values.quoteTotal : quote.total;
  const hasPressureWashing = values.selectedServices.includes("pressure_washing");
  const paymentMode = total <= 0 ? "lead_only" : hasPressureWashing ? "deposit" : "full";
  const depositDue = paymentMode === "deposit" ? (total >= 300 ? 100 : 50) : paymentMode === "full" ? total : 0;
  const storedQuote = {
    ...quote,
    subtotal: total,
    total,
    depositDue,
    paymentMode,
    manualReview: true,
    lineItems:
      values.quoteTotal && values.quoteTotal > 0
        ? [
            {
              label: "Owner quick quote",
              amount: total,
              note: "Created manually from the admin app during a customer interaction.",
            },
          ]
        : quote.lineItems,
  };

  if (!sql) {
    return null;
  }

  const result = await sql`
    INSERT INTO bookings (
      customer_name, phone, email, instagram_handle, primary_service, frequency, status,
      property_type, address_line_1, city, state, zip, distance_miles, travel_surcharge,
      preferred_date, preferred_time_window, quote_total, deposit_due, payment_mode, customer_action_token,
      heavy_stain_level, bins_count, gate_code_needed, gate_code, driveway_sqft, walkway_sqft,
      patio_sqft, house_sqft, fence_linear_feet, photo_urls, notes, referral_source, terms_accepted,
      privacy_accepted, sms_opt_in, email_opt_in, quote_json
    ) VALUES (
      ${values.customerName},
      ${values.phone.replace(/\D/g, "")},
      ${values.email || "no-email@curbside.local"},
      ${null},
      ${values.selectedServices.join(",")},
      ${"one_time"},
      ${"lead"},
      ${values.propertyType},
      ${values.addressLine1},
      ${values.city},
      ${values.state.toUpperCase()},
      ${values.zip},
      ${quote.serviceArea.miles ?? null},
      ${quote.serviceArea.travelSurcharge},
      ${values.preferredDate},
      ${values.preferredTimeWindow},
      ${total},
      ${depositDue},
      ${paymentMode},
      ${crypto.randomUUID()},
      ${values.heavyStainLevel ?? "light"},
      ${values.binsCount || null},
      ${false},
      ${null},
      ${values.drivewaySqft || null},
      ${values.walkwaySqft || null},
      ${values.patioSqft || null},
      ${values.houseSqft || null},
      ${values.fenceLinearFeet || null},
      ${JSON.stringify([])},
      ${values.notes || "Owner-created quote from admin app."},
      ${"owner_created"},
      ${true},
      ${true},
      ${true},
      ${true},
      ${JSON.stringify(storedQuote)}
    )
    RETURNING *
  `;

  revalidatePath("/admin");
  return ((result as BookingRecord[])[0] ?? null);
}

function isMissingPhotoUrlsColumnError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("photo_urls") && message.includes("does not exist");
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

export async function getBookingById(id: string) {
  const sql = getSql();
  if (!sql) return null;

  const result = await sql`
    SELECT * FROM bookings
    WHERE id = ${id}
    LIMIT 1
  `;

  return ((result as BookingRecord[])[0] ?? null);
}

export async function getBookingByCustomerActionToken(token: string) {
  const sql = getSql();
  if (!sql) return null;

  const result = await sql`
    SELECT * FROM bookings
    WHERE customer_action_token = ${token}
    LIMIT 1
  `;

  return ((result as BookingRecord[])[0] ?? null);
}

export async function updateBookingById(
  id: string,
  updates: {
    status?: string;
    preferredDate?: string | null;
    preferredTimeWindow?: string | null;
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
      preferred_date = COALESCE(${updates.preferredDate ?? null}, preferred_date),
      preferred_time_window = COALESCE(${updates.preferredTimeWindow ?? null}, preferred_time_window),
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

export async function updateBookingCustomerTimeRequest(
  id: string,
  updates: {
    preferredDate: string;
    preferredTimeWindow: string;
    ownerNotes: string;
  },
) {
  const sql = getSql();
  if (!sql) return null;

  const result = await sql`
    UPDATE bookings
    SET
      status = 'pending_confirmation',
      preferred_date = ${updates.preferredDate},
      preferred_time_window = ${updates.preferredTimeWindow},
      scheduled_date = NULL,
      scheduled_time_window = NULL,
      owner_notes = ${updates.ownerNotes},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  revalidatePath("/admin");
  return ((result as BookingRecord[])[0] ?? null);
}

export async function notifyCustomerBookingUpdated(booking: BookingRecord) {
  try {
    await bookingStatusEmail(booking);
  } catch {}
}

export async function notifyCustomerPaymentReceived(booking: BookingRecord) {
  try {
    await customerPaymentReceivedEmail(booking);
  } catch {}
}
