import type { QuoteResult } from "@/lib/pricing";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTitle(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatBoolean(value: boolean | null | undefined) {
  return value ? "Yes" : "No";
}

export function parseQuoteJson(value: unknown): QuoteResult | null {
  if (!value) return null;

  if (typeof value === "object") {
    return value as QuoteResult;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as QuoteResult;
    } catch {
      return null;
    }
  }

  return null;
}

export function formatDateTime(value: unknown) {
  if (!value) return "Not set";

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDateOnly(value: unknown) {
  if (!value) return "Not set";

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
