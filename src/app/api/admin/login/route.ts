import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createAdminSession } from "@/lib/auth";
import { ADMIN_COOKIE_NAME } from "@/lib/business";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (
    username !== (process.env.ADMIN_USERNAME ?? "ere") ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, createAdminSession(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
