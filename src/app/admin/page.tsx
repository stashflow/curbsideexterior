import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminSession } from "@/lib/auth";
import { getAllBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const bookings = await getAllBookings();

  return <AdminDashboard bookings={bookings} username={session.username} />;
}
