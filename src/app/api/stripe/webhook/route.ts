import { NextResponse } from "next/server";

import { updateBookingById } from "@/lib/bookings";
import { getSql } from "@/lib/db";
import { sendTransactionalEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { BUSINESS_NAME } from "@/lib/business";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sql = getSql();

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, secret);

    if (sql) {
      await sql`
        INSERT INTO stripe_webhook_events (stripe_event_id, event_type, payload)
        VALUES (${event.id}, ${event.type}, ${JSON.stringify(event)})
        ON CONFLICT (stripe_event_id) DO NOTHING
      `;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        const updated = await updateBookingById(bookingId, {
          status: "pending_confirmation",
          stripePaymentStatus: "paid",
          stripeCheckoutSessionId: session.id,
        });

        if (updated) {
          try {
            await sendTransactionalEmail({
              to: updated.email,
              subject: `${BUSINESS_NAME} payment received`,
              html: `<p>Hi ${updated.customer_name},</p><p>We received your payment and your booking is now pending final confirmation.</p>`,
              text: `Hi ${updated.customer_name}, we received your payment and your booking is now pending final confirmation.`,
            });
          } catch {}
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook failed." }, { status: 400 });
  }
}
