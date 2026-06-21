import { randomUUID } from "node:crypto";

import { getSql } from "@/lib/db";

export type WorkerRole = "Job Lead" | "Helper" | "Sales / Booking" | "Driver" | "Owner/Admin";
export type ExpenseCategory =
  | "Gas"
  | "Chemicals"
  | "Equipment"
  | "Supplies"
  | "Advertising"
  | "Website / Software"
  | "Insurance"
  | "Payment Processing"
  | "Vehicle"
  | "Payroll / Labor"
  | "Refund"
  | "Other";

export type WorkerEntry = {
  id: string;
  name: string;
  role: WorkerRole;
  hours: number;
  bonus: number;
  notes: string;
  overridePay: number | null;
};

export type ExpenseEntry = {
  id: string;
  date: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  paidBy: string;
  paymentMethod: string;
  reimbursable: boolean;
  reimbursed: boolean;
  relatedJob: string;
  notes: string;
};

export type MoneySplit = {
  directExpenses: number;
  netJobMoney: number;
  taxExpenseReserve: number;
  laborPool: number;
  businessProfit: number;
  workerPayouts: Array<WorkerEntry & { suggestedPay: number; finalPay: number }>;
};

export type PostgameRecord = {
  id: string;
  customerName: string;
  customerAddress: string;
  jobDate: string;
  services: string[];
  notes: string;
  originalQuote: number;
  finalCharged: number;
  discountType: string;
  discountAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  workers: WorkerEntry[];
  expenses: ExpenseEntry[];
  split: MoneySplit;
  createdAt: string;
};

export type MoneyData = {
  postgames: PostgameRecord[];
  expenses: ExpenseEntry[];
  usingDatabase: boolean;
};

type Sql = NonNullable<ReturnType<typeof getSql>>;

type PostgameRow = {
  id: string;
  customer_name: string;
  customer_address: string | null;
  job_date: string | Date;
  services: unknown;
  notes: string | null;
  original_quote: number;
  final_charged: number;
  discount_type: string | null;
  discount_amount: number;
  payment_method: string | null;
  payment_status: string | null;
  workers: unknown;
  expenses: unknown;
  split: unknown;
  created_at: string | Date;
};

type ExpenseRow = {
  id: string;
  date: string | Date;
  name: string;
  category: ExpenseCategory;
  amount: number;
  paid_by: string | null;
  payment_method: string | null;
  reimbursable: boolean | null;
  reimbursed: boolean | null;
  related_job: string | null;
  notes: string | null;
};

export const moneyServices = [
  "House Washing",
  "Driveway Cleaning",
  "Sidewalk Cleaning",
  "Soft Washing",
  "Trash Can Cleaning",
  "Curb Number Painting",
  "Other",
];

export const expenseCategories: ExpenseCategory[] = [
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
];

export const roleWeights: Record<WorkerRole, number> = {
  "Job Lead": 1.5,
  Helper: 1,
  "Sales / Booking": 1.25,
  Driver: 1.1,
  "Owner/Admin": 0.75,
};

function cleanNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function isoDate(value: string | Date) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function isoDateTime(value: string | Date) {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export function createWorker(name = "Emerson"): WorkerEntry {
  return { id: randomUUID(), name, role: "Job Lead", hours: 1.5, bonus: 0, notes: "", overridePay: null };
}

export function createExpenseDraft(): ExpenseEntry {
  return {
    id: randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    name: "",
    category: "Gas",
    amount: 0,
    paidBy: "Business Account",
    paymentMethod: "Card",
    reimbursable: false,
    reimbursed: false,
    relatedJob: "",
    notes: "",
  };
}

export function calculateSplit(finalCharged: number, workers: WorkerEntry[], expenses: ExpenseEntry[]): MoneySplit {
  const directExpenses = expenses.reduce((sum, expense) => sum + cleanNumber(expense.amount), 0);
  const netJobMoney = Math.max(0, cleanNumber(finalCharged) - directExpenses);
  const taxExpenseReserve = Math.round(netJobMoney * 0.25);
  const laborPool = Math.round(netJobMoney * 0.5);
  const businessProfit = netJobMoney - taxExpenseReserve - laborPool;
  const totalWeight = workers.reduce((sum, worker) => sum + roleWeights[worker.role] * Math.max(0, cleanNumber(worker.hours)), 0);
  const workerPayouts = workers.map((worker) => {
    const suggestedPay =
      totalWeight > 0
        ? Math.round(laborPool * ((roleWeights[worker.role] * Math.max(0, cleanNumber(worker.hours))) / totalWeight))
        : 0;
    const finalPay = worker.overridePay ?? suggestedPay + cleanNumber(worker.bonus);

    return { ...worker, suggestedPay, finalPay };
  });

  return { directExpenses, netJobMoney, taxExpenseReserve, laborPool, businessProfit, workerPayouts };
}

async function ensureMoneyTables(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_postgames (
      id text PRIMARY KEY,
      customer_name text NOT NULL,
      customer_address text NOT NULL DEFAULT '',
      job_date date NOT NULL,
      services jsonb NOT NULL DEFAULT '[]'::jsonb,
      notes text NOT NULL DEFAULT '',
      original_quote integer NOT NULL DEFAULT 0,
      final_charged integer NOT NULL DEFAULT 0,
      discount_type text NOT NULL DEFAULT 'None',
      discount_amount integer NOT NULL DEFAULT 0,
      payment_method text NOT NULL DEFAULT 'Card',
      payment_status text NOT NULL DEFAULT 'Paid',
      workers jsonb NOT NULL DEFAULT '[]'::jsonb,
      expenses jsonb NOT NULL DEFAULT '[]'::jsonb,
      split jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_expenses (
      id text PRIMARY KEY,
      date date NOT NULL,
      name text NOT NULL,
      category text NOT NULL,
      amount integer NOT NULL DEFAULT 0,
      paid_by text NOT NULL DEFAULT '',
      payment_method text NOT NULL DEFAULT '',
      reimbursable boolean NOT NULL DEFAULT false,
      reimbursed boolean NOT NULL DEFAULT false,
      related_job text NOT NULL DEFAULT '',
      notes text NOT NULL DEFAULT '',
      postgame_id text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
}

function toPostgameRecord(row: PostgameRow): PostgameRecord {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerAddress: row.customer_address ?? "",
    jobDate: isoDate(row.job_date),
    services: parseJson<string[]>(row.services, []),
    notes: row.notes ?? "",
    originalQuote: Number(row.original_quote) || 0,
    finalCharged: Number(row.final_charged) || 0,
    discountType: row.discount_type ?? "None",
    discountAmount: Number(row.discount_amount) || 0,
    paymentMethod: row.payment_method ?? "Card",
    paymentStatus: row.payment_status ?? "Paid",
    workers: parseJson<WorkerEntry[]>(row.workers, []),
    expenses: parseJson<ExpenseEntry[]>(row.expenses, []),
    split: parseJson<MoneySplit>(row.split, calculateSplit(Number(row.final_charged) || 0, [], [])),
    createdAt: isoDateTime(row.created_at),
  };
}

function toExpenseEntry(row: ExpenseRow): ExpenseEntry {
  return {
    id: row.id,
    date: isoDate(row.date),
    name: row.name,
    category: row.category,
    amount: Number(row.amount) || 0,
    paidBy: row.paid_by ?? "",
    paymentMethod: row.payment_method ?? "",
    reimbursable: Boolean(row.reimbursable),
    reimbursed: Boolean(row.reimbursed),
    relatedJob: row.related_job ?? "",
    notes: row.notes ?? "",
  };
}

export async function getMoneyData(): Promise<MoneyData> {
  const sql = getSql();
  if (!sql) return { postgames: [], expenses: [], usingDatabase: false };

  await ensureMoneyTables(sql);
  const [postgameRows, expenseRows] = await Promise.all([
    sql`SELECT * FROM admin_postgames ORDER BY job_date DESC, created_at DESC`,
    sql`SELECT * FROM admin_expenses ORDER BY date DESC, created_at DESC LIMIT 300`,
  ]);

  return {
    postgames: (postgameRows as PostgameRow[]).map(toPostgameRecord),
    expenses: (expenseRows as ExpenseRow[]).map(toExpenseEntry),
    usingDatabase: true,
  };
}

export async function saveExpenseEntry(entry: ExpenseEntry) {
  const sql = getSql();
  if (!sql) throw new Error("Neon DATABASE_URL is not configured.");

  await ensureMoneyTables(sql);
  const id = entry.id || randomUUID();

  await sql`
    INSERT INTO admin_expenses (
      id,
      date,
      name,
      category,
      amount,
      paid_by,
      payment_method,
      reimbursable,
      reimbursed,
      related_job,
      notes
    )
    VALUES (
      ${id},
      ${entry.date},
      ${entry.name},
      ${entry.category},
      ${Math.round(cleanNumber(entry.amount))},
      ${entry.paidBy},
      ${entry.paymentMethod},
      ${entry.reimbursable},
      ${entry.reimbursed},
      ${entry.relatedJob},
      ${entry.notes}
    )
    ON CONFLICT (id) DO UPDATE SET
      date = EXCLUDED.date,
      name = EXCLUDED.name,
      category = EXCLUDED.category,
      amount = EXCLUDED.amount,
      paid_by = EXCLUDED.paid_by,
      payment_method = EXCLUDED.payment_method,
      reimbursable = EXCLUDED.reimbursable,
      reimbursed = EXCLUDED.reimbursed,
      related_job = EXCLUDED.related_job,
      notes = EXCLUDED.notes
  `;

  return getMoneyData();
}

export async function savePostgameRecord(record: PostgameRecord) {
  const sql = getSql();
  if (!sql) throw new Error("Neon DATABASE_URL is not configured.");

  await ensureMoneyTables(sql);
  const id = record.id || randomUUID();
  const directExpenses = record.expenses.map((expense) => ({
    ...expense,
    id: expense.id || randomUUID(),
    relatedJob: record.customerName,
  }));

  await sql`
    INSERT INTO admin_postgames (
      id,
      customer_name,
      customer_address,
      job_date,
      services,
      notes,
      original_quote,
      final_charged,
      discount_type,
      discount_amount,
      payment_method,
      payment_status,
      workers,
      expenses,
      split,
      created_at
    )
    VALUES (
      ${id},
      ${record.customerName},
      ${record.customerAddress},
      ${record.jobDate},
      ${JSON.stringify(record.services)}::jsonb,
      ${record.notes},
      ${Math.round(cleanNumber(record.originalQuote))},
      ${Math.round(cleanNumber(record.finalCharged))},
      ${record.discountType},
      ${Math.round(cleanNumber(record.discountAmount))},
      ${record.paymentMethod},
      ${record.paymentStatus},
      ${JSON.stringify(record.workers)}::jsonb,
      ${JSON.stringify(directExpenses)}::jsonb,
      ${JSON.stringify(record.split)}::jsonb,
      ${record.createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      customer_name = EXCLUDED.customer_name,
      customer_address = EXCLUDED.customer_address,
      job_date = EXCLUDED.job_date,
      services = EXCLUDED.services,
      notes = EXCLUDED.notes,
      original_quote = EXCLUDED.original_quote,
      final_charged = EXCLUDED.final_charged,
      discount_type = EXCLUDED.discount_type,
      discount_amount = EXCLUDED.discount_amount,
      payment_method = EXCLUDED.payment_method,
      payment_status = EXCLUDED.payment_status,
      workers = EXCLUDED.workers,
      expenses = EXCLUDED.expenses,
      split = EXCLUDED.split
  `;

  for (const expense of directExpenses) {
    await sql`
      INSERT INTO admin_expenses (
        id,
        date,
        name,
        category,
        amount,
        paid_by,
        payment_method,
        reimbursable,
        reimbursed,
        related_job,
        notes,
        postgame_id
      )
      VALUES (
        ${expense.id},
        ${expense.date},
        ${expense.name || "Job expense"},
        ${expense.category},
        ${Math.round(cleanNumber(expense.amount))},
        ${expense.paidBy},
        ${expense.paymentMethod},
        ${expense.reimbursable},
        ${expense.reimbursed},
        ${expense.relatedJob},
        ${expense.notes},
        ${id}
      )
      ON CONFLICT (id) DO UPDATE SET
        date = EXCLUDED.date,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        amount = EXCLUDED.amount,
        paid_by = EXCLUDED.paid_by,
        payment_method = EXCLUDED.payment_method,
        reimbursable = EXCLUDED.reimbursable,
        reimbursed = EXCLUDED.reimbursed,
        related_job = EXCLUDED.related_job,
        notes = EXCLUDED.notes,
        postgame_id = EXCLUDED.postgame_id
    `;
  }

  return getMoneyData();
}

export async function deletePostgameRecord(id: string) {
  const sql = getSql();
  if (!sql) throw new Error("Neon DATABASE_URL is not configured.");

  await ensureMoneyTables(sql);
  await sql`DELETE FROM admin_expenses WHERE postgame_id = ${id}`;
  await sql`DELETE FROM admin_postgames WHERE id = ${id}`;

  return getMoneyData();
}

export async function deleteExpenseEntry(id: string) {
  const sql = getSql();
  if (!sql) throw new Error("Neon DATABASE_URL is not configured.");

  await ensureMoneyTables(sql);
  await sql`DELETE FROM admin_expenses WHERE id = ${id}`;

  return getMoneyData();
}
