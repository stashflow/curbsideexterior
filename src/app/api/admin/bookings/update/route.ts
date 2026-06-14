import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { notifyCustomerBookingUpdated, updateBookingById } from "@/lib/bookings";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  const scheduledTimeWindow = String(formData.get("scheduledTimeWindow") ?? "");
  const ownerNotes = String(formData.get("ownerNotes") ?? "");

  if (!id) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const updated = await updateBookingById(id, {
    status: status || undefined,
    scheduledDate: scheduledDate || null,
    scheduledTimeWindow: scheduledTimeWindow || null,
    ownerNotes: ownerNotes || null,
  });

  if (updated && (status || scheduledDate || scheduledTimeWindow)) {
    await notifyCustomerBookingUpdated(updated);
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}
