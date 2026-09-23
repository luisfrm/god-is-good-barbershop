import type { BlockedDate } from "@/types/scheduling";
import {
  deleteBlockedDate,
  insertBlockedDate,
  listBlockedDates,
  listBlockedDatesFrom,
} from "@/server/repositories/blockedDates";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

export async function getBlockedDates(): Promise<BlockedDate[]> {
  return listBlockedDates();
}

export async function getBlockedDatesFrom(fromDate: string): Promise<BlockedDate[]> {
  return listBlockedDatesFrom(fromDate);
}

export async function addBlockedDate(
  date: string,
  reason: string
): Promise<{ error?: string }> {
  if (!isValidDateKey(date)) return { error: "Fecha inválida" };
  await insertBlockedDate(date, reason.trim());
  return {};
}

export async function removeBlockedDate(date: string): Promise<void> {
  await deleteBlockedDate(date);
}

export function blockedDateSet(dates: BlockedDate[]): Set<string> {
  return new Set(dates.map((d) => d.date));
}
