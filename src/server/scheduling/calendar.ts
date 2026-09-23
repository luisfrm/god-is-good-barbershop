/**
 * Pure helpers for building a Monday-first month grid from date keys
 * (YYYY-MM-DD). No timezone math happens here — callers pass zoned keys.
 */

export const CALENDAR_MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const CALENDAR_WEEKDAY_LABELS = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
] as const;

export function isMonthKey(value: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(value)) return false;
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
}

export function parseMonthKey(
  value: string | undefined,
  fallback: string
): string {
  return value && isMonthKey(value) ? value : fallback;
}

export function monthKeyFromDateKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7)) - 1 + delta;
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export function formatMonthLabel(monthKey: string): string {
  const year = monthKey.slice(0, 4);
  const month = Number(monthKey.slice(5, 7));
  return `${CALENDAR_MONTH_LABELS[month - 1] ?? monthKey} ${year}`;
}

export function firstDateOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
}

export function lastDateOfMonth(monthKey: string): string {
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${monthKey}-${String(day).padStart(2, "0")}`;
}

export interface CalendarCell {
  date: string;
  inMonth: boolean;
}

/** 42 cells (6 weeks) starting on the Monday of the week holding day 1. */
export function monthGrid(monthKey: string): CalendarCell[] {
  const first = new Date(`${firstDateOfMonth(monthKey)}T00:00:00Z`);
  const offset = (first.getUTCDay() + 6) % 7; // Monday = 0
  const start = new Date(first.getTime() - offset * 86_400_000);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start.getTime() + i * 86_400_000);
    const key = date.toISOString().slice(0, 10);
    cells.push({ date: key, inMonth: key.slice(0, 7) === monthKey });
  }
  return cells;
}

export function dayOfMonth(dateKey: string): number {
  return Number(dateKey.slice(8, 10));
}
