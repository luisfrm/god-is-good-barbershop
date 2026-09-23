import {
  WEEKDAY_FROM_INDEX,
  type GeneratedDay,
  type GeneratedSlot,
  type WorkDaySchedule,
} from "@/types/scheduling";
import { minutesToTime, timeToMinutes } from "@/server/scheduling/time";

/** Date key YYYY-MM-DD for `date` interpreted in `timeZone`. */
export function zonedDateKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function weekdayOfDateKey(dateKey: string) {
  const day = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return WEEKDAY_FROM_INDEX[day] ?? "monday";
}

export function getRangesForWeekday(
  workHours: WorkDaySchedule[],
  weekday: string
) {
  return workHours.find((d) => d.day === weekday)?.ranges ?? [];
}

/**
 * Generate stepped slots: every `sessionDuration` minutes inside each
 * configured range, ensuring start + duration <= range end.
 */
export function generateSlots(
  workHours: WorkDaySchedule[],
  timeZone: string,
  sessionDuration: number,
  from: Date,
  count: number
): GeneratedDay[] {
  const days: GeneratedDay[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(from.getTime() + i * 86_400_000);
    const dateKey = zonedDateKey(date, timeZone);
    const weekday = weekdayOfDateKey(dateKey);
    const ranges = getRangesForWeekday(workHours, weekday);
    const slots: GeneratedSlot[] = [];

    for (const range of ranges) {
      const startM = timeToMinutes(range.start);
      const endM = timeToMinutes(range.end);
      if (startM === null || endM === null) continue;
      for (let t = startM; t + sessionDuration <= endM; t += sessionDuration) {
        slots.push({
          start: minutesToTime(t),
          end: minutesToTime(t + sessionDuration),
          booked: false,
        });
      }
    }

    days.push({ date: dateKey, weekday, slots });
  }
  return days;
}

export function markBookedSlots(
  days: GeneratedDay[],
  appointments: { date: string; start_time: string; status: string }[]
): GeneratedDay[] {
  return days.map((day) => ({
    ...day,
    slots: day.slots.map((slot) => ({
      ...slot,
      booked: appointments.some(
        (a) =>
          a.date === day.date &&
          a.start_time === slot.start &&
          a.status !== "cancelled"
      ),
    })),
  }));
}

/**
 * Remove availability for fully blocked dates (holidays / time off) while
 * keeping the day in the list so callers can render it as closed.
 */
export function applyBlockedDates(
  days: GeneratedDay[],
  blockedDates: Iterable<string>
): GeneratedDay[] {
  const blocked = new Set(blockedDates);
  return days.map((day) =>
    blocked.has(day.date) ? { ...day, slots: [] } : day
  );
}

export function buildAvailability(
  workHours: WorkDaySchedule[],
  timeZone: string,
  sessionDuration: number,
  from: Date,
  count: number,
  appointments: { date: string; start_time: string; status: string }[],
  blockedDates: string[] = []
): GeneratedDay[] {
  return applyBlockedDates(
    markBookedSlots(
      generateSlots(workHours, timeZone, sessionDuration, from, count),
      appointments
    ),
    blockedDates
  );
}

export function formatSlotLabel(slot: GeneratedSlot): string {
  return `${slot.start} – ${slot.end}`;
}
