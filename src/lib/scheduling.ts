import type { TimeWindow } from "@/lib/pricing";

export const timeWindowOptions: TimeWindow[] = ["8-10", "10-12", "12-2", "2-4", "4-6"];
export const closedDayTimeWindows: TimeWindow[] = [...timeWindowOptions];

function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isClosedServiceDate(value: string) {
  return parseDateInput(value)?.getDay() === 0;
}

export function isBookableServiceDate(value: string) {
  const date = parseDateInput(value);
  return Boolean(date && date.getDay() !== 0);
}

export function getNextBookableServiceDate(start: Date, daysFromStart = 1) {
  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + daysFromStart);

  while (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

export function getBookableDaysForMonth(year: number, month: number) {
  const totalDays = new Date(year, month, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => index + 1).filter((day) => {
    return new Date(year, month - 1, day).getDay() !== 0;
  });
}
