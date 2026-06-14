import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE_NAME } from "@/lib/business";

export async function POST(request: Request) {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
