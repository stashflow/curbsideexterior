import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { getBookingById, notifyCustomerBookingUpdated, updateBookingById } from "@/lib/bookings";
import {
  customerJobAcceptedEmail,
  customerJobDeclinedEmail,
  customerRescheduleRequestedEmail,
} from "@/lib/email";
import { formatServiceList } from "@/lib/format";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();

  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "save");
  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  const scheduledTimeWindow = String(formData.get("scheduledTimeWindow") ?? "");
  const ownerNotes = String(formData.get("ownerNotes") ?? "");

  if (!id) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const booking = await getBookingById(id);
  if (!booking) {
    return NextResponse.redirect(new URL("/admin?error=missing-booking", request.url));
  }

  let updated = null;

  if (action === "accept") {
    const alreadyPaid = booking.stripe_payment_status === "paid";
    const needsPayment = !alreadyPaid && booking.deposit_due > 0;
    const nextDate = scheduledDate || booking.scheduled_date || booking.preferred_date;
    const nextWindow = scheduledTimeWindow || booking.scheduled_time_window || booking.preferred_time_window;

    updated = await updateBookingById(id, {
      status: needsPayment ? "payment_required" : "confirmed",
      scheduledDate: nextDate,
      scheduledTimeWindow: nextWindow,
      ownerNotes: ownerNotes || booking.owner_notes,
    });

    if (updated) {
      const paymentLinks = needsPayment
        ? await createBookingPaymentLinks(updated, request.url)
        : undefined;
      await customerJobAcceptedEmail(updated, paymentLinks);
    }
  } else if (action === "deny") {
    updated = await updateBookingById(id, {
      status: "cancelled",
      ownerNotes: ownerNotes || booking.owner_notes,
    });

    if (updated) {
      await customerJobDeclinedEmail(updated);
    }
  } else if (action === "reschedule") {
    if (!scheduledDate || !scheduledTimeWindow) {
      return NextResponse.redirect(new URL("/admin?error=reschedule-needs-time", request.url));
    }

    updated = await updateBookingById(id, {
      status: "reschedule_requested",
      scheduledDate,
      scheduledTimeWindow,
      ownerNotes: ownerNotes || booking.owner_notes,
    });

    if (updated) {
      await customerRescheduleRequestedEmail(updated);
    }
  } else if (action === "complete") {
    updated = await updateBookingById(id, {
      status: "completed",
      ownerNotes: ownerNotes || booking.owner_notes,
    });
  } else {
    const status = String(formData.get("status") ?? "");
    updated = await updateBookingById(id, {
      status: status || undefined,
      scheduledDate: scheduledDate || null,
      scheduledTimeWindow: scheduledTimeWindow || null,
      ownerNotes: ownerNotes || null,
    });
  }

  if (updated && action === "save") {
    await notifyCustomerBookingUpdated(updated);
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}

async function createBookingPaymentLinks(booking: NonNullable<Awaited<ReturnType<typeof getBookingById>>>, requestUrl: string) {
  const stripe = getStripe();
  if (!stripe) return undefined;

  const url = new URL(requestUrl);
  const fullAmount = booking.quote_total;
  const depositAmount = booking.deposit_due;
  const service = formatServiceList(booking.primary_service);

  const depositCheckout =
    depositAmount > 0
      ? await stripe.checkout.sessions.create({
          mode: "payment",
          success_url: `${url.origin}/book/success?booking=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${url.origin}/book/cancel?booking=${booking.id}`,
          customer_email: booking.email,
          metadata: {
            bookingId: booking.id,
            service: booking.primary_service,
            paymentMode: "deposit",
          },
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Upfront fee - ${service}`,
                  description: `Booking deposit for ${booking.customer_name}`,
                },
                unit_amount: depositAmount * 100,
              },
            },
          ],
        })
      : null;

  const fullCheckout =
    fullAmount > depositAmount
      ? await stripe.checkout.sessions.create({
          mode: "payment",
          success_url: `${url.origin}/book/success?booking=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${url.origin}/book/cancel?booking=${booking.id}`,
          customer_email: booking.email,
          metadata: {
            bookingId: booking.id,
            service: booking.primary_service,
            paymentMode: "full",
          },
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                product_data: {
                  name: `Pay in full - ${service}`,
                  description: `Full payment for ${booking.customer_name}`,
                },
                unit_amount: fullAmount * 100,
              },
            },
          ],
        })
      : null;

  if (depositCheckout?.id) {
    await updateBookingById(booking.id, {
      stripeCheckoutSessionId: depositCheckout.id,
    });
  }

  return {
    depositUrl: depositCheckout?.url ?? null,
    fullUrl: fullCheckout?.url ?? null,
  };
}
