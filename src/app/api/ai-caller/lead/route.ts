import { NextResponse } from "next/server";
import { z } from "zod";

import { aiCallerLeadOwnerAlert } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const estimateBreakdownSchema = z.object({
  label: z.string().min(1).max(120),
  amount: z.union([z.coerce.number(), z.string().max(80)]).optional(),
  note: z.string().max(300).optional(),
});

const aiCallerLeadSchema = z.object({
  customerName: z.string().max(100).optional(),
  phone: z.string().max(40).optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(180).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(20).optional(),
  zip: z.string().max(12).optional(),
  services: z.array(z.string().max(80)).max(12).optional(),
  estimateTotal: z.coerce.number().min(0).optional(),
  estimateBreakdown: z.array(estimateBreakdownSchema).max(20).optional(),
  depositRequired: z.coerce.number().min(0).optional(),
  preferredDate: z.string().max(40).optional(),
  preferredTimeWindow: z.string().max(40).optional(),
  urgency: z.string().max(80).optional(),
  leadType: z.enum(["ready_to_book", "owner_review", "question", "other"]).default("owner_review"),
  notes: z.string().max(3000).optional(),
  transcriptSummary: z.string().max(3000).optional(),
  callRecordingUrl: z.string().url().optional().or(z.literal("")),
  source: z.string().max(80).default("ai_caller"),
});

function isAuthorized(request: Request) {
  const secret = process.env.AI_CALLER_WEBHOOK_SECRET;
  if (!secret) return true;

  const authorization = request.headers.get("authorization") ?? "";
  return authorization === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = aiCallerLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid lead payload." },
        { status: 400 },
      );
    }

    const hasContact = Boolean(parsed.data.phone || parsed.data.email);
    if (!hasContact) {
      return NextResponse.json(
        { error: "Lead must include at least a phone number or email." },
        { status: 400 },
      );
    }

    const result = await aiCallerLeadOwnerAlert({
      ...parsed.data,
      email: parsed.data.email || undefined,
      callRecordingUrl: parsed.data.callRecordingUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      emailed: !result.skipped,
      message: result.skipped
        ? "Lead accepted, but email sending is not configured."
        : "Lead emailed to owner notification list.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not process AI caller lead." }, { status: 500 });
  }
}
