import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { ADMIN_COOKIE_NAME } from "@/lib/business";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "local-dev-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createAdminSession(username: string) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = `${username}:${expiresAt}`;
  const signature = sign(payload);
  return `${payload}:${signature}`;
}

export function verifyAdminSession(token: string | undefined | null) {
  if (!token) return null;

  const [username, expiresAt, signature] = token.split(":");
  if (!username || !expiresAt || !signature) return null;

  const payload = `${username}:${expiresAt}`;
  const expected = sign(payload);
  const valid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!valid) return null;
  if (Number(expiresAt) < Date.now()) return null;

  return { username };
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(token);
}
