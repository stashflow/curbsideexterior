import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CurbsideEstimator } from "@/components/admin/curbside-estimator";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Curbside Estimator | CURBSIDE EXTERIOR CO.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminEstimatorPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return <CurbsideEstimator />;
}
