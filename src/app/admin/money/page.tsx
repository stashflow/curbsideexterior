import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MoneyWorkspace } from "@/components/admin/money-workspace";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Money Dashboard | CURBSIDE EXTERIOR CO.",
  robots: { index: false, follow: false },
};

export default async function MoneyPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <MoneyWorkspace mode="money" />;
}
