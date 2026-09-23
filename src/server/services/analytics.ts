import {
  countAppointmentsByStatus,
  listAppointmentsInRange,
} from "@/server/repositories/appointments";
import { getSchedulingSettings } from "@/server/services/settings";
import { getAvailability, todayKey } from "@/server/services/appointments";
import {
  averagePerDay,
  buildDailySeries,
  buildHourlyLoad,
  statusDistributionFromCounts,
  cancellationRate,
  completionRate,
  dateRangeKeys,
  occupancyPercent,
  percentChange,
  shiftDateKey,
  type DailyCount,
  type HourLoad,
  type StatusSlice,
} from "@/server/scheduling/analytics";

export interface DashboardKpis {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  todayCount: number;
  upcoming: number;
  windowTotal: number;
  previousWindowTotal: number;
  trendPercent: number | null;
  completionRate: number;
  cancellationRate: number;
  averagePerDay: number;
  occupancy: number;
  freeSlots: number;
  totalSlots: number;
}

export interface DashboardAnalytics {
  timezone: string;
  today: string;
  /** Window length in days used by the charts. */
  windowDays: number;
  days: DailyCount[];
  statuses: StatusSlice[];
  hourly: HourLoad[];
  kpis: DashboardKpis;
}

/**
 * Aggregates everything the dashboard shows: activity series, status mix,
 * busiest hours, occupancy for the next days and period-over-period trend.
 */
export async function getDashboardAnalytics(
  windowDays = 14,
  upcomingDays = 7
): Promise<DashboardAnalytics> {
  const { timezone } = await getSchedulingSettings();
  const today = todayKey(timezone);

  const windowKeys = dateRangeKeys(today, windowDays);
  const previousKeys = dateRangeKeys(shiftDateKey(today, -windowDays), windowDays);
  const from = previousKeys[0];
  const to = shiftDateKey(today, upcomingDays - 1);

  const [rows, byStatus, availability] = await Promise.all([
    listAppointmentsInRange(from, to),
    countAppointmentsByStatus(),
    getAvailability(upcomingDays),
  ]);

  const days = buildDailySeries(rows, windowKeys);
  const previousDays = buildDailySeries(rows, previousKeys);

  const windowTotal = days.reduce((sum, day) => sum + day.total, 0);
  const previousWindowTotal = previousDays.reduce(
    (sum, day) => sum + day.total,
    0
  );

  const windowRows = rows.filter((a) => windowKeys.includes(a.date));
  const upcoming = rows.filter(
    (a) => a.date >= today && a.status !== "cancelled"
  );

  const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
  const pending = byStatus.pending ?? 0;
  const confirmed = byStatus.confirmed ?? 0;
  const completed = byStatus.completed ?? 0;
  const cancelled = byStatus.cancelled ?? 0;

  const totalSlots = availability.days.reduce(
    (sum, day) => sum + day.slots.length,
    0
  );
  const bookedSlots = availability.days.reduce(
    (sum, day) => sum + day.slots.filter((slot) => slot.booked).length,
    0
  );

  return {
    timezone,
    today,
    windowDays,
    days,
    statuses: statusDistributionFromCounts(byStatus),
    hourly: buildHourlyLoad(windowRows, 6),
    kpis: {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      todayCount: days.find((day) => day.date === today)?.total ?? 0,
      upcoming: upcoming.length,
      windowTotal,
      previousWindowTotal,
      trendPercent: percentChange(windowTotal, previousWindowTotal),
      completionRate: completionRate(completed, total, cancelled),
      cancellationRate: cancellationRate(cancelled, total),
      averagePerDay: averagePerDay(windowTotal, windowDays),
      occupancy: occupancyPercent(bookedSlots, totalSlots),
      freeSlots: Math.max(0, totalSlots - bookedSlots),
      totalSlots,
    },
  };
}
