import { minutesToTime, timeToMinutes } from "@/server/scheduling/time";

/** End time for a start time + duration (minutes). */
export function calculateSlotEndTime(
  startTime: string,
  durationMinutes: number
): string {
  const startMins = timeToMinutes(startTime);
  if (startMins === null) return startTime;
  return minutesToTime(startMins + durationMinutes);
}
