import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getBookingByCustomerActionToken,
  notifyCustomerBookingUpdated,
  updateBookingById,
  updateBookingCustomerTimeRequest,
} from "@/lib/bookings";
import { customerJobDeclinedEmail } from "@/lib/email";

export const runtime = "nodejs";

const responseSchema = z.object({
  token: z.string().min(8),
  action: z.enum(["accept", "decline", "choose_other"]),
  preferredDate: z.string().optional(),
  preferredTimeWindow: z.enum(["8-10", "10-12", "12-2", "2-4", "4-6"]).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  return handleResponse({
    token: url.searchParams.get("token") ?? "",
    action: url.searchParams.get("action") ?? "",
  }, url.origin);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const url = new URL(request.url);

  return handleResponse({
    token: String(formData.get("token") ?? ""),
    action: String(formData.get("action") ?? ""),
    preferredDate: String(formData.get("preferredDate") ?? ""),
    preferredTimeWindow: String(formData.get("preferredTimeWindow") ?? ""),
  }, url.origin);
}

async function handleResponse(body: unknown, origin: string) {
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.redirect(`${origin}/book/respond?error=invalid`);
  }

  const booking = await getBookingByCustomerActionToken(parsed.data.token);
  if (!booking) {
    return NextResponse.redirect(`${origin}/book/respond?error=expired`);
  }

  if (parsed.data.action === "accept") {
    const updated = await updateBookingById(booking.id, {
      status: booking.deposit_due > 0 && booking.stripe_payment_status !== "paid" ? "payment_required" : "confirmed",
    });

    if (updated) await notifyCustomerBookingUpdated(updated);
    return NextResponse.redirect(`${origin}/book/respond?success=accepted`);
  }

  if (parsed.data.action === "decline") {
    const updated = await updateBookingById(booking.id, {
      status: "cancelled",
      ownerNotes: appendOwnerNote(booking.owner_notes, "Customer declined/cancelled from response link."),
    });

    if (updated) await customerJobDeclinedEmail(updated);
    return NextResponse.redirect(`${origin}/book/respond?success=declined`);
  }

  if (!parsed.data.preferredDate || !parsed.data.preferredTimeWindow) {
    return NextResponse.redirect(`${origin}/book/respond?token=${parsed.data.token}&error=pick-time`);
  }

  const updated = await updateBookingCustomerTimeRequest(booking.id, {
    preferredDate: parsed.data.preferredDate,
    preferredTimeWindow: parsed.data.preferredTimeWindow,
    ownerNotes: appendOwnerNote(
      booking.owner_notes,
      `Customer requested another time: ${parsed.data.preferredDate} ${parsed.data.preferredTimeWindow}.`,
    ),
  });

  if (updated) await notifyCustomerBookingUpdated(updated);
  return NextResponse.redirect(`${origin}/book/respond?success=choose_other`);
}

function appendOwnerNote(current: string | null, note: string) {
  const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
  return [current, `[${stamp}] ${note}`].filter(Boolean).join("\n");
}
