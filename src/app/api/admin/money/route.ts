import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { getMoneyData } from "@/lib/admin-money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await getMoneyData());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load money data." }, { status: 500 });
  }
}
