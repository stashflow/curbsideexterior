import { NextResponse } from "next/server";

import { notifyCustomerPaymentReceived, updateBookingById } from "@/lib/bookings";
import { getSql } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

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
          await notifyCustomerPaymentReceived(updated);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook failed." }, { status: 400 });
  }
}
