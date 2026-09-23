/**
 * Pure aggregation helpers for the panel dashboard. Everything here works on
 * plain appointment rows (date / status / start_time) so it can be unit tested
 * without a database.
 */

import type { AppointmentStatus } from "@/types/scheduling";
import { APPOINTMENT_STATUSES } from "@/types/scheduling";

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendientes",
  confirmed: "Confirmadas",
  completed: "Completadas",
  cancelled: "Canceladas",
};

/** Hex colors reused by the dashboard donut/bars (match Tailwind palette). */
export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  completed: "#0ea5e9",
  cancelled: "#ef4444",
};

/** Shift a YYYY-MM-DD key by whole days (calendar math, no timezone). */
export function shiftDateKey(dateKey: string, delta: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateKey;
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/** `days` consecutive date keys ending at (and including) `endDate`. */
export function dateRangeKeys(endDate: string, days: number): string[] {
  const safeDays = Math.max(1, Math.round(days));
  const keys: string[] = [];
  for (let i = safeDays - 1; i >= 0; i--) {
    keys.push(shiftDateKey(endDate, -i));
  }
  return keys;
}

export interface DailyCount {
  date: string;
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

type DatedStatus = { date: string; status: AppointmentStatus };

/** Count appointments per day. Days outside `dateKeys` are ignored. */
export function buildDailySeries(
  appointments: DatedStatus[],
  dateKeys: string[]
): DailyCount[] {
  const index = new Map<string, DailyCount>();
  for (const date of dateKeys) {
    index.set(date, {
      date,
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    });
  }

  for (const appointment of appointments) {
    const bucket = index.get(appointment.date);
    if (!bucket) continue;
    bucket.total += 1;
    bucket[appointment.status] += 1;
  }

  return dateKeys.map((date) => index.get(date) as DailyCount);
}

export interface StatusSlice {
  status: AppointmentStatus;
  label: string;
  color: string;
  count: number;
  percent: number;
}

export function statusDistributionFromCounts(
  counts: Partial<Record<AppointmentStatus, number>>,
  order: AppointmentStatus[] = APPOINTMENT_STATUSES
): StatusSlice[] {
  const total = order.reduce((sum, status) => sum + (counts[status] ?? 0), 0);
  return order.map((status) => {
    const count = counts[status] ?? 0;
    return {
      status,
      label: STATUS_LABELS[status],
      color: STATUS_COLORS[status],
      count,
      percent: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });
}

export function buildStatusDistribution(
  appointments: { status: AppointmentStatus }[],
  order: AppointmentStatus[] = APPOINTMENT_STATUSES
): StatusSlice[] {
  const counts: Partial<Record<AppointmentStatus, number>> = {};
  for (const appointment of appointments) {
    counts[appointment.status] = (counts[appointment.status] ?? 0) + 1;
  }
  return statusDistributionFromCounts(counts, order);
}

export interface HourLoad {
  hour: number;
  label: string;
  count: number;
}

/** Appointments grouped by starting hour, busiest first. */
export function buildHourlyLoad(
  appointments: { start_time: string }[],
  limit = 6
): HourLoad[] {
  const counts = new Map<number, number>();
  for (const appointment of appointments) {
    const hour = Number(appointment.start_time.slice(0, 2));
    if (!Number.isFinite(hour)) continue;
    counts.set(hour, (counts.get(hour) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([hour, count]) => ({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.hour - b.hour)
    .slice(0, limit);
}

/** Percentage change between two periods; null when there is no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Rounded 0–100 occupancy. */
export function occupancyPercent(booked: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((booked / total) * 100);
}

/**
 * Completion rate over non-cancelled appointments (cancelled ones would
 * otherwise punish a healthy schedule).
 */
export function completionRate(
  completed: number,
  total: number,
  cancelled: number
): number {
  const considered = total - cancelled;
  if (considered <= 0) return 0;
  return Math.round((completed / considered) * 100);
}

export function cancellationRate(cancelled: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((cancelled / total) * 100);
}

export function averagePerDay(total: number, days: number): number {
  if (days <= 0) return 0;
  return Math.round((total / days) * 10) / 10;
}

/** Picks the two longest runs of consecutive dates for the chart labels. */
export function formatShortDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  return `${Number(day)}/${Number(month)}`;
}
