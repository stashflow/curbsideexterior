import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { GrindBoard } from "@/components/admin/grind-board";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Grind Board | CURBSIDE EXTERIOR CO.",
  robots: { index: false, follow: false },
};

export default async function AdminGrindPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <GrindBoard />;
}
