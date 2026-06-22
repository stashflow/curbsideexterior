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

type UnknownRecord = Record<string, unknown>;

function isAuthorized(request: Request) {
  const secret = process.env.AI_CALLER_WEBHOOK_SECRET;
  if (!secret) return true;

  const authorization = request.headers.get("authorization") ?? "";
  return authorization === `Bearer ${secret}`;
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function getString(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return undefined;
}

function getNumber(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }

  return undefined;
}

function getStringArray(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean).slice(0, 12);
    if (typeof value === "string" && value.trim()) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 12);
    }
  }

  return undefined;
}

function getBreakdown(record: UnknownRecord) {
  const value = record.estimateBreakdown ?? record.estimate_breakdown ?? record.quote_breakdown;
  if (!Array.isArray(value)) return undefined;

  return value
    .map((item) => {
      const row = asRecord(item);
      const label = getString(row, ["label", "name", "item"]);
      if (!label) return null;

      return {
        label,
        amount: getString(row, ["amount", "price", "total"]),
        note: getString(row, ["note", "description"]),
      };
    })
    .filter((item): item is { label: string; amount?: string; note?: string } => Boolean(item))
    .slice(0, 20);
}

function normalizeLeadPayload(body: unknown) {
  const root = asRecord(body);
  const args = asRecord(root.args);
  const data = asRecord(root.data);
  const call = asRecord(root.call);
  const rootAnalysis = asRecord(root.call_analysis);
  const callAnalysis = asRecord(call.call_analysis);
  const rootCustomAnalysis = asRecord(rootAnalysis.custom_analysis_data);
  const callCustomAnalysis = asRecord(callAnalysis.custom_analysis_data);
  const custom = asRecord(root.metadata);
  const candidate = {
    ...root,
    ...data,
    ...call,
    ...rootAnalysis,
    ...callAnalysis,
    ...custom,
    ...rootCustomAnalysis,
    ...callCustomAnalysis,
    ...args,
  };

  return {
    customerName: getString(candidate, ["customerName", "customer_name", "name", "full_name"]),
    phone: getString(candidate, ["phone", "phone_number", "from_number", "caller_number", "customer_phone"]),
    email: getString(candidate, ["email", "customer_email"]),
    address: getString(candidate, ["address", "street_address", "service_address"]),
    city: getString(candidate, ["city"]),
    state: getString(candidate, ["state"]),
    zip: getString(candidate, ["zip", "zipcode", "postal_code"]),
    services: getStringArray(candidate, ["services", "service", "requested_services"]),
    estimateTotal: getNumber(candidate, ["estimateTotal", "estimate_total", "quoteTotal", "quote_total", "total"]),
    estimateBreakdown: getBreakdown(candidate),
    depositRequired: getNumber(candidate, ["depositRequired", "deposit_required", "deposit", "deposit_due"]),
    preferredDate: getString(candidate, ["preferredDate", "preferred_date", "date"]),
    preferredTimeWindow: getString(candidate, ["preferredTimeWindow", "preferred_time_window", "time_window"]),
    urgency: getString(candidate, ["urgency"]),
    leadType: getString(candidate, ["leadType", "lead_type"]) as "ready_to_book" | "owner_review" | "question" | "other" | undefined,
    notes: getString(candidate, ["notes", "note"]),
    transcriptSummary: getString(candidate, ["transcriptSummary", "transcript_summary", "summary", "call_summary", "transcript"]),
    callRecordingUrl: getString(candidate, ["callRecordingUrl", "call_recording_url", "recording_url", "recordingUrl"]),
    source: getString(candidate, ["source"]) ?? "retell_ai_caller",
  };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const normalized = normalizeLeadPayload(body);
    const parsed = aiCallerLeadSchema.safeParse(normalized);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: true,
          emailed: false,
          message: "Webhook received, but no usable lead fields were found yet.",
        },
        { status: 200 },
      );
    }

    const hasContact = Boolean(parsed.data.phone || parsed.data.email);
    if (!hasContact) {
      return NextResponse.json(
        {
          success: true,
          emailed: false,
          message: "Webhook received. No owner email sent because the event did not include a phone or email.",
        },
        { status: 200 },
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

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "CURBSIDE AI caller webhook is live. Send lead events with POST.",
  });
}
