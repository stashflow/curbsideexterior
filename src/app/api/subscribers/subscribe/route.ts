import { NextResponse } from "next/server";
import { z } from "zod";

import { subscribeAndWelcome } from "@/lib/subscribers";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  firstName: z.string().trim().max(80).optional(),
  zip: z.string().trim().max(10).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid signup request." },
        { status: 400 },
      );
    }

    const subscriber = await subscribeAndWelcome({
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      zip: parsed.data.zip,
      source: "homepage",
      cadence: "balanced",
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Email list is not configured right now." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "You are on the list. We will keep it useful and low-pressure.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "We could not save your email right now. Please try again." },
      { status: 500 },
    );
  }
}
