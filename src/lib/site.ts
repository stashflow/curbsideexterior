import { BUSINESS_NAME } from "@/lib/business";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://curbsideexterior.com";

export const SITE_DESCRIPTION =
  "Premium pressure washing, trash can cleaning, and curb number painting for homeowners, HOAs, and property managers in Marietta and nearby areas.";

export const SITE_TITLE = `${BUSINESS_NAME} | Exterior Cleaning In Marietta`;
