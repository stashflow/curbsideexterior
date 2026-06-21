import { NextResponse } from "next/server";
import { z } from "zod";

import { deleteExpenseEntry, saveExpenseEntry } from "@/lib/admin-money";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const expenseSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  name: z.string().min(1),
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

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = expenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid expense." },
        { status: 400 },
      );
    }

    return NextResponse.json(await saveExpenseEntry(parsed.data));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save expense." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing expense id." }, { status: 400 });
  }

  try {
    return NextResponse.json(await deleteExpenseEntry(id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete expense." }, { status: 500 });
  }
}
