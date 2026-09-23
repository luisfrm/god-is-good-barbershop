import { getDb } from "@/server/db";
import type { BlockedDate } from "@/types/scheduling";

export async function listBlockedDates(): Promise<BlockedDate[]> {
  const rows = await getDb()
    .prepare("SELECT * FROM blocked_dates ORDER BY date ASC")
    .all<BlockedDate>();
  return rows.results;
}

export async function listBlockedDatesFrom(
  fromDate: string
): Promise<BlockedDate[]> {
  const rows = await getDb()
    .prepare("SELECT * FROM blocked_dates WHERE date >= ?1 ORDER BY date ASC")
    .bind(fromDate)
    .all<BlockedDate>();
  return rows.results;
}

export async function insertBlockedDate(
  date: string,
  reason: string
): Promise<void> {
  await getDb()
    .prepare(
      `INSERT INTO blocked_dates (date, reason)
       VALUES (?1, ?2)
       ON CONFLICT(date) DO UPDATE SET reason = excluded.reason`
    )
    .bind(date, reason)
    .run();
}

export async function deleteBlockedDate(date: string): Promise<void> {
  await getDb()
    .prepare("DELETE FROM blocked_dates WHERE date = ?1")
    .bind(date)
    .run();
}
