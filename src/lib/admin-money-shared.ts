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

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createWorker(name = "Emerson"): WorkerEntry {
  return { id: newId(), name, role: "Job Lead", hours: 1.5, bonus: 0, notes: "", overridePay: null };
}

export function createExpenseDraft(): ExpenseEntry {
  return {
    id: newId(),
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
