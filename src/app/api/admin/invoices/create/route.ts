import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const invoiceSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  description: z.string().min(3).max(160),
  amount: z.coerce.number().int().positive(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid invoice request." },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const { customerEmail, customerName, description, amount } = parsed.data;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      success_url: `${url.origin}/book/success?invoice=paid`,
      cancel_url: `${url.origin}/admin`,
      metadata: {
        createdBy: session.username,
        invoiceType: "manual_admin_invoice",
        customerName,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: description,
              description: `Payment request for ${customerName}`,
            },
            unit_amount: amount * 100,
          },
        },
      ],
    });

    return NextResponse.json({
      url: checkout.url,
      id: checkout.id,
      amount,
      customerName,
      customerEmail,
      description,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not create payment link right now." },
      { status: 500 },
    );
  }
}
