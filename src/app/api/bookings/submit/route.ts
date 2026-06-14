import { NextResponse } from "next/server";

import { bookingFormSchema } from "@/lib/booking-schema";
import { createBookingSubmission, updateBookingById } from "@/lib/bookings";
import { formatServiceList } from "@/lib/format";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid booking request." },
        { status: 400 },
      );
    }

    const { booking, quote } = await createBookingSubmission(parsed.data);

    if (!booking) {
      return NextResponse.json({
        bookingId: null,
        checkoutUrl: null,
        quote,
      });
    }

    if (
      quote.paymentMode !== "manual_confirmation" &&
      quote.paymentMode !== "lead_only" &&
      quote.depositDue > 0
    ) {
      const stripe = getStripe();
      if (!stripe) {
        return NextResponse.json({
          bookingId: booking.id,
          checkoutUrl: null,
          quote,
        });
      }

      const url = new URL(request.url);
      const chargeAmount = quote.paymentMode === "deposit" ? quote.depositDue : quote.total;

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${url.origin}/book/success?booking=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url.origin}/book/cancel?booking=${booking.id}`,
        customer_email: booking.email,
        metadata: {
          bookingId: booking.id,
          service: booking.primary_service,
          paymentMode: quote.paymentMode,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              product_data: {
                name:
                  quote.paymentMode === "deposit"
                    ? `Deposit - ${formatServiceList(booking.primary_service)}`
                    : formatServiceList(booking.primary_service),
                description: `Booking for ${booking.customer_name}`,
              },
              unit_amount: chargeAmount * 100,
            },
          },
        ],
      });

      await updateBookingById(booking.id, {
        stripeCheckoutSessionId: session.id,
      });

      return NextResponse.json({
        bookingId: booking.id,
        checkoutUrl: session.url,
        quote,
      });
    }

    return NextResponse.json({
      bookingId: booking.id,
      checkoutUrl: null,
      quote,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "We couldn't process your request right now. Please try again." },
      { status: 500 },
    );
  }
}
