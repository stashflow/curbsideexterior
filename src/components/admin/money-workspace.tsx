"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  CalendarDays,
  ClipboardCheck,
  Plus,
  ReceiptText,
  Save,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";

import {
  calculateSplit,
  createExpenseDraft,
  createWorker,
  expenseCategories,
  moneyServices,
  roleWeights,
  type ExpenseCategory,
  type ExpenseEntry,
  type MoneyData,
  type PostgameRecord,
  type WorkerEntry,
  type WorkerRole,
} from "@/lib/admin-money-shared";
import { formatCurrency } from "@/lib/format";

type Mode = "postgame" | "expenses" | "money";

const today = new Date().toISOString().slice(0, 10);

function money(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/48">{label}</p>
      <p className="mt-2 font-heading text-4xl font-black uppercase italic leading-none text-white">{value}</p>
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</span>
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#0B67F0]" />
    </label>
  );
}

export function MoneyWorkspace({ mode }: { mode: Mode }) {
  const [postgames, setPostgames] = useState<PostgameRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [databaseReady, setDatabaseReady] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [jobDate, setJobDate] = useState(today);
  const [selectedServices, setSelectedServices] = useState<string[]>(["Driveway Cleaning"]);
  const [notes, setNotes] = useState("");
  const [originalQuote, setOriginalQuote] = useState(0);
  const [finalCharged, setFinalCharged] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [workers, setWorkers] = useState<WorkerEntry[]>([createWorker("Emerson")]);
  const [jobExpenses, setJobExpenses] = useState<ExpenseEntry[]>([]);
  const [expenseDraft, setExpenseDraft] = useState<ExpenseEntry>(createExpenseDraft());

  useEffect(() => {
    let active = true;

    async function loadMoneyData() {
      try {
        const response = await fetch("/api/admin/money", { cache: "no-store" });
        const data = (await response.json()) as MoneyData & { error?: string };

        if (!active) return;
        if (!response.ok) throw new Error(data.error ?? "Could not load money data.");

        setPostgames(data.postgames);
        setExpenses(data.expenses);
        setDatabaseReady(data.usingDatabase);
        setStatusMessage(data.usingDatabase ? "" : "Neon is not connected yet. Add DATABASE_URL in Vercel to save money data.");
      } catch (error) {
        if (!active) return;
        setDatabaseReady(false);
        setStatusMessage(error instanceof Error ? error.message : "Could not load money data.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadMoneyData();

    return () => {
      active = false;
    };
  }, []);

  function syncMoneyData(data: MoneyData) {
    setPostgames(data.postgames);
    setExpenses(data.expenses);
    setDatabaseReady(data.usingDatabase);
  }

  const split = useMemo(() => calculateSplit(finalCharged, workers, jobExpenses), [finalCharged, workers, jobExpenses]);
  const monthlyExpenses = expenses.filter((expense) => expense.date.startsWith(today.slice(0, 7))).reduce((sum, expense) => sum + expense.amount, 0);
  const allTimeExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const unreimbursed = expenses.filter((expense) => expense.reimbursable && !expense.reimbursed).reduce((sum, expense) => sum + expense.amount, 0);
  const revenue = postgames.reduce((sum, job) => sum + job.finalCharged, 0);
  const profit = postgames.reduce((sum, job) => sum + job.split.businessProfit, 0);

  function toggleService(service: string) {
    setSelectedServices((current) => (current.includes(service) ? current.filter((item) => item !== service) : [...current, service]));
  }

  function addJobExpense() {
    setJobExpenses((current) => [...current, { ...createExpenseDraft(), relatedJob: customerName || "Current job" }]);
  }

  async function savePostgame() {
    setIsSaving(true);
    setStatusMessage("");

    const record: PostgameRecord = {
      id: crypto.randomUUID(),
      customerName: customerName || "Unnamed customer",
      customerAddress,
      jobDate,
      services: selectedServices,
      notes,
      originalQuote: money(originalQuote),
      finalCharged: money(finalCharged),
      discountType,
      discountAmount: money(discountAmount),
      paymentMethod,
      paymentStatus,
      workers,
      expenses: jobExpenses,
      split,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/admin/money/postgame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      const data = (await response.json()) as MoneyData & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Could not save postgame.");

      syncMoneyData(data);
      setCustomerName("");
      setCustomerAddress("");
      setOriginalQuote(0);
      setFinalCharged(0);
      setNotes("");
      setJobExpenses([]);
      setWorkers([createWorker("Emerson")]);
      setStatusMessage("Postgame saved to Neon.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save postgame.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveExpense() {
    if (!expenseDraft.name || expenseDraft.amount <= 0) return;
    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await fetch("/api/admin/money/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...expenseDraft, id: crypto.randomUUID() }),
      });
      const data = (await response.json()) as MoneyData & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Could not save expense.");

      syncMoneyData(data);
      setExpenseDraft(createExpenseDraft());
      setStatusMessage("Expense saved to Neon.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save expense.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePostgame(id: string) {
    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/admin/money/postgame?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as MoneyData & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Could not delete postgame.");

      syncMoneyData(data);
      setStatusMessage("Postgame deleted.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not delete postgame.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteExpense(id: string) {
    setIsSaving(true);
    setStatusMessage("");

    try {
      const response = await fetch(`/api/admin/money/expenses?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as MoneyData & { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Could not delete expense.");

      syncMoneyData(data);
      setStatusMessage("Expense deleted.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not delete expense.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
        <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
          <ArrowLeft className="size-4" />
          Admin
        </Link>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase italic tracking-[0.2em] text-[#0B67F0]">Business Money</p>
            <h1 className="mt-2 font-heading text-5xl font-black uppercase italic leading-none text-white sm:text-6xl">
              {mode === "postgame" ? "Postgame" : mode === "expenses" ? "Expenses" : "Money Dashboard"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
              Finish jobs, protect taxes, pay workers cleanly, track expenses, and keep growth money in the business.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/admin/postgame" className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center text-xs font-bold uppercase italic tracking-[0.1em] text-white/70">Postgame</Link>
            <Link href="/admin/expenses" className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center text-xs font-bold uppercase italic tracking-[0.1em] text-white/70">Expenses</Link>
            <Link href="/admin/money" className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-center text-xs font-bold uppercase italic tracking-[0.1em] text-white/70">Money</Link>
          </div>
        </div>
      </div>

      {isLoading || statusMessage ? (
        <div
          className={`mt-5 rounded-[1.4rem] border px-4 py-3 text-sm leading-6 ${
            databaseReady
              ? "border-[#0B67F0]/20 bg-[#0B67F0]/10 text-[#BFD7FF]"
              : "border-amber-300/24 bg-amber-400/10 text-amber-100"
          }`}
        >
          {isLoading ? "Loading money workspace..." : statusMessage}
        </div>
      ) : null}

      {mode === "money" ? (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-3 md:grid-cols-5">
            <StatCard label="Revenue saved" value={formatCurrency(revenue)} />
            <StatCard label="Business profit" value={formatCurrency(profit)} />
            <StatCard label="Month expenses" value={formatCurrency(monthlyExpenses)} />
            <StatCard label="All expenses" value={formatCurrency(allTimeExpenses)} />
            <StatCard label="Unreimbursed" value={formatCurrency(unreimbursed)} />
          </div>
          <History postgames={postgames} expenses={expenses} onDeleteJob={deletePostgame} onDeleteExpense={deleteExpense} />
        </div>
      ) : null}

      {mode === "expenses" ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <section className="rounded-[1.6rem] border border-white/10 bg-black/24 p-5">
            <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">Add Expense</p>
            <div className="mt-4 grid gap-3">
              <TextInput label="Date" type="date" value={expenseDraft.date} onChange={(value) => setExpenseDraft({ ...expenseDraft, date: value })} />
              <TextInput label="Expense name" value={expenseDraft.name} onChange={(value) => setExpenseDraft({ ...expenseDraft, name: value })} />
              <TextInput label="Amount" type="number" value={expenseDraft.amount} onChange={(value) => setExpenseDraft({ ...expenseDraft, amount: Number(value) })} />
              <Select label="Category" value={expenseDraft.category} options={expenseCategories} onChange={(value) => setExpenseDraft({ ...expenseDraft, category: value as ExpenseCategory })} />
              <Select label="Paid by" value={expenseDraft.paidBy} options={["Business Account", "Emerson", "Mom/Owner", "Worker", "Other"]} onChange={(value) => setExpenseDraft({ ...expenseDraft, paidBy: value })} />
              <Select label="Payment method" value={expenseDraft.paymentMethod} options={["Cash", "Card", "Zelle", "Cash App", "Check", "Other"]} onChange={(value) => setExpenseDraft({ ...expenseDraft, paymentMethod: value })} />
              <TextInput label="Related job" value={expenseDraft.relatedJob} onChange={(value) => setExpenseDraft({ ...expenseDraft, relatedJob: value })} />
              <label className="flex items-center gap-3 text-sm text-white/78"><input type="checkbox" checked={expenseDraft.reimbursable} onChange={(event) => setExpenseDraft({ ...expenseDraft, reimbursable: event.target.checked })} /> Reimbursable</label>
              <label className="flex items-center gap-3 text-sm text-white/78"><input type="checkbox" checked={expenseDraft.reimbursed} onChange={(event) => setExpenseDraft({ ...expenseDraft, reimbursed: event.target.checked })} /> Reimbursed</label>
              <button type="button" onClick={saveExpense} disabled={isSaving || isLoading || !databaseReady} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#0B67F0]/70 bg-[#0B67F0] px-5 text-sm font-black uppercase italic tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-45">
                <Save className="size-4" />
                {isSaving ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </section>
          <History postgames={postgames} expenses={expenses} onDeleteJob={deletePostgame} onDeleteExpense={deleteExpense} />
        </div>
      ) : null}

      {mode === "postgame" ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <section className="grid gap-5">
            <Panel title="Job Info" icon={ClipboardCheck}>
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput label="Customer name" value={customerName} onChange={setCustomerName} />
                <TextInput label="Customer address" value={customerAddress} onChange={setCustomerAddress} />
                <TextInput label="Job date" type="date" value={jobDate} onChange={setJobDate} />
                <Select label="Payment status" value={paymentStatus} options={["Paid", "Partially Paid", "Unpaid"]} onChange={setPaymentStatus} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                {moneyServices.map((service) => (
                  <button key={service} type="button" onClick={() => toggleService(service)} className={`rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${selectedServices.includes(service) ? "border-[#0B67F0]/60 bg-[#0B67F0]/16 text-white" : "border-white/10 bg-black/20 text-white/58"}`}>{service}</button>
                ))}
              </div>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="What did we do?" className="mt-4 min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none" />
              <div className="mt-4 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] px-4 py-5 text-sm text-white/58">Before/after receipt photo upload placeholder. Storage is already used elsewhere, so this can be wired to Blob when you want saved media.</div>
            </Panel>

            <Panel title="Money Collected" icon={WalletCards}>
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput label="Original quoted price" type="number" value={originalQuote} onChange={(value) => setOriginalQuote(Number(value))} />
                <TextInput label="Final amount charged" type="number" value={finalCharged} onChange={(value) => setFinalCharged(Number(value))} />
                <Select label="Promotion / discount" value={discountType} options={["None", "First Customer Discount", "Neighbor Discount", "Bundle Discount", "Manual Discount"]} onChange={setDiscountType} />
                <TextInput label="Discount amount" type="number" value={discountAmount} onChange={(value) => setDiscountAmount(Number(value))} />
                <Select label="Payment method" value={paymentMethod} options={["Cash", "Card", "Zelle", "Cash App", "Check", "Other"]} onChange={setPaymentMethod} />
              </div>
              {finalCharged > 0 && originalQuote > 0 && finalCharged < originalQuote ? (
                <p className="mt-4 rounded-2xl border border-amber-300/24 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">Final amount is lower than the original quote. Make sure the discount is intentional.</p>
              ) : null}
            </Panel>

            <Panel title="Workers" icon={Users}>
              <div className="grid gap-3">
                {workers.map((worker) => (
                  <div key={worker.id} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                    <div className="grid gap-3 md:grid-cols-5">
                      <TextInput label="Name" value={worker.name} onChange={(value) => setWorkers(workers.map((item) => item.id === worker.id ? { ...item, name: value } : item))} />
                      <Select label="Role" value={worker.role} options={Object.keys(roleWeights)} onChange={(value) => setWorkers(workers.map((item) => item.id === worker.id ? { ...item, role: value as WorkerRole } : item))} />
                      <TextInput label="Hours" type="number" value={worker.hours} onChange={(value) => setWorkers(workers.map((item) => item.id === worker.id ? { ...item, hours: Number(value) } : item))} />
                      <TextInput label="Bonus" type="number" value={worker.bonus} onChange={(value) => setWorkers(workers.map((item) => item.id === worker.id ? { ...item, bonus: Number(value) } : item))} />
                      <TextInput label="Override pay" type="number" value={worker.overridePay ?? ""} onChange={(value) => setWorkers(workers.map((item) => item.id === worker.id ? { ...item, overridePay: value ? Number(value) : null } : item))} />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setWorkers([...workers, createWorker(`Worker ${workers.length + 1}`)])} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-bold uppercase tracking-[0.12em] text-white">
                <Plus className="size-4" />
                Add Worker
              </button>
            </Panel>
          </section>

          <section className="grid gap-5 xl:sticky xl:top-5 xl:self-start">
            <Panel title="Direct Job Expenses" icon={ReceiptText}>
              <div className="grid gap-2">
                {jobExpenses.map((expense) => (
                  <div key={expense.id} className="grid gap-2 rounded-2xl border border-white/8 bg-black/20 p-3 md:grid-cols-[1fr_8rem_auto]">
                    <input value={expense.name} onChange={(event) => setJobExpenses(jobExpenses.map((item) => item.id === expense.id ? { ...item, name: event.target.value } : item))} placeholder="Expense name" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" />
                    <input type="number" value={expense.amount} onChange={(event) => setJobExpenses(jobExpenses.map((item) => item.id === expense.id ? { ...item, amount: Number(event.target.value) } : item))} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" />
                    <button type="button" onClick={() => setJobExpenses(jobExpenses.filter((item) => item.id !== expense.id))} className="flex size-10 items-center justify-center rounded-xl border border-white/10 text-white/60"><Trash2 className="size-4" /></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addJobExpense} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-bold uppercase tracking-[0.12em] text-white">
                <Plus className="size-4" />
                Add Expense
              </button>
            </Panel>

            <Panel title="Where The Money Goes" icon={BadgeDollarSign}>
              <div className="grid gap-2 text-sm text-white/78">
                <MoneyLine label="Job collected" value={finalCharged} />
                <MoneyLine label="Direct expenses" value={split.directExpenses} />
                <MoneyLine label="Net money" value={split.netJobMoney} strong />
                <MoneyLine label="Tax/expense reserve" value={split.taxExpenseReserve} />
                <MoneyLine label="Labor payouts" value={split.laborPool} />
                <MoneyLine label="Business profit/growth" value={split.businessProfit} strong />
              </div>
              <p className="mt-4 rounded-2xl border border-[#0B67F0]/18 bg-[#0B67F0]/10 px-4 py-3 text-sm leading-6 text-[#BFD7FF]">Do not pay out 100% of the job. The business needs money for taxes, gas, chemicals, equipment, insurance, ads, and repairs.</p>
              <div className="mt-4 grid gap-2">
                {split.workerPayouts.map((worker) => (
                  <div key={worker.id} className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{worker.name}</p>
                        <p className="text-xs text-white/48">{worker.role} • {worker.hours} hrs • Bonus {formatCurrency(worker.bonus)}</p>
                      </div>
                      <p className="font-semibold text-[#BFD7FF]">{formatCurrency(worker.finalPay)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={savePostgame} disabled={isSaving || isLoading || !databaseReady} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#0B67F0]/70 bg-[#0B67F0] px-5 text-sm font-black uppercase italic tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-45">
                <Save className="size-4" />
                {isSaving ? "Saving..." : "Save Postgame"}
              </button>
            </Panel>
          </section>

          <div className="xl:col-span-2">
            <History postgames={postgames} expenses={expenses} onDeleteJob={deletePostgame} onDeleteExpense={deleteExpense} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#0B67F0]">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-black/24 p-5">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-[#BFD7FF]" />
        <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">{title}</p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MoneyLine({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border border-white/8 px-3 py-2 ${strong ? "bg-[#0B67F0]/10 text-white" : "bg-white/[0.03]"}`}>
      <span>{label}</span>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );
}

function History({
  postgames,
  expenses,
  onDeleteJob,
  onDeleteExpense,
}: {
  postgames: PostgameRecord[];
  expenses: ExpenseEntry[];
  onDeleteJob: (id: string) => void;
  onDeleteExpense: (id: string) => void;
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-black/24 p-5">
      <div className="flex items-center gap-3">
        <CalendarDays className="size-5 text-[#BFD7FF]" />
        <p className="text-sm font-black uppercase italic tracking-[0.16em] text-[#0B67F0]">History</p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/46">Postgames</p>
          {postgames.length === 0 ? <p className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/58">No postgames saved yet.</p> : postgames.map((job) => (
            <article key={job.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{job.customerName}</p>
                  <p className="mt-1 text-xs text-white/46">{job.jobDate} • {job.paymentStatus} • {job.paymentMethod}</p>
                </div>
                <button type="button" onClick={() => confirm("Delete this postgame?") && onDeleteJob(job.id)} className="text-white/42"><Trash2 className="size-4" /></button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <MoneyLine label="Charged" value={job.finalCharged} />
                <MoneyLine label="Labor" value={job.split.laborPool} />
                <MoneyLine label="Profit" value={job.split.businessProfit} />
              </div>
            </article>
          ))}
        </div>
        <div className="grid gap-3 content-start">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/46">Expenses</p>
          {expenses.length === 0 ? <p className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/58">No expenses saved yet.</p> : expenses.slice(0, 10).map((expense) => (
            <article key={expense.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{expense.name || "Expense"}</p>
                  <p className="mt-1 text-xs text-white/46">{expense.date} • {expense.category} • Paid by {expense.paidBy}</p>
                  {expense.relatedJob ? <p className="mt-1 text-xs text-[#BFD7FF]">{expense.relatedJob}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-[#BFD7FF]">{formatCurrency(expense.amount)}</p>
                  <button type="button" onClick={() => confirm("Delete this expense?") && onDeleteExpense(expense.id)} className="text-white/42"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
