import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminSession } from "@/lib/auth";
import { getAllBookings } from "@/lib/bookings";
import { getAllSubscribers } from "@/lib/subscribers";
import { getAllTestimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin | CURBSIDE EXTERIOR CO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [bookings, subscribers, testimonials] = await Promise.all([
    getAllBookings(),
    getAllSubscribers(),
    getAllTestimonials(),
  ]);

  return (
    <AdminDashboard
      bookings={bookings}
      subscribers={subscribers}
      testimonials={testimonials}
      username={session.username}
    />
  );
}
