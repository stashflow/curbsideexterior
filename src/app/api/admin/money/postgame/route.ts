import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateSplit, deletePostgameRecord, savePostgameRecord } from "@/lib/admin-money";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const workerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["Job Lead", "Helper", "Sales / Booking", "Driver", "Owner/Admin"]),
  hours: z.coerce.number().min(0),
  bonus: z.coerce.number().min(0),
  notes: z.string().default(""),
  overridePay: z.coerce.number().min(0).nullable(),
});

const expenseSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  name: z.string().default(""),
  category: z.enum([
    "Gas",
    "Chemicals",
    "Equipment",
    "Supplies",
    "Advertising",
    "Website / Software",
    "Insurance",
    "Payment Processing",
    "Vehicle",
    "Payroll / Labor",
    "Refund",
    "Other",
  ]),
  amount: z.coerce.number().min(0),
  paidBy: z.string().default(""),
  paymentMethod: z.string().default(""),
  reimbursable: z.boolean().default(false),
  reimbursed: z.boolean().default(false),
  relatedJob: z.string().default(""),
  notes: z.string().default(""),
});

const postgameSchema = z.object({
  id: z.string().min(1),
  customerName: z.string().min(1),
  customerAddress: z.string().default(""),
  jobDate: z.string().min(1),
  services: z.array(z.string()).min(1),
  notes: z.string().default(""),
  originalQuote: z.coerce.number().min(0),
  finalCharged: z.coerce.number().min(0),
  discountType: z.string().default("None"),
  discountAmount: z.coerce.number().min(0),
  paymentMethod: z.string().default("Card"),
  paymentStatus: z.string().default("Paid"),
  workers: z.array(workerSchema).min(1),
  expenses: z.array(expenseSchema).default([]),
  createdAt: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = postgameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid postgame." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      await savePostgameRecord({
        ...parsed.data,
        split: calculateSplit(parsed.data.finalCharged, parsed.data.workers, parsed.data.expenses),
      }),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save postgame." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing postgame id." }, { status: 400 });
  }

  try {
    return NextResponse.json(await deletePostgameRecord(id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete postgame." }, { status: 500 });
  }
}
