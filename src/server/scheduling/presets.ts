import {
  DEFAULT_WORK_RANGE,
  PRESET_WEEKDAYS,
  WEEKDAYS,
  type SchedulePreset,
  type TimeRange,
  type Weekday,
  type WorkDaySchedule,
} from "@/types/scheduling";

/**
 * Days that a preset opens (weekday order). "custom" has no fixed days and
 * returns an empty list — callers keep the user's selection.
 */
export function presetWeekdays(preset: SchedulePreset): Weekday[] {
  if (preset === "custom") return [];
  return [...PRESET_WEEKDAYS[preset]];
}

/**
 * Build a full week schedule for a preset. `custom` returns the provided
 * current schedule unchanged (there is nothing to derive).
 */
export function buildScheduleForPreset(
  preset: SchedulePreset,
  range: TimeRange = DEFAULT_WORK_RANGE,
  current: WorkDaySchedule[] = []
): WorkDaySchedule[] {
  if (preset === "custom") return current;
  const open = new Set(presetWeekdays(preset));
  return WEEKDAYS.filter((day) => open.has(day)).map((day) => ({
    day,
    ranges: [{ ...range }],
  }));
}

/**
 * Infer which preset a schedule matches, based only on which weekdays are
 * open. Any schedule with a different set of open days is "custom".
 */
export function detectSchedulePreset(
  workHours: WorkDaySchedule[]
): SchedulePreset {
  const open = new Set(
    workHours.filter((d) => d.ranges.length > 0).map((d) => d.day)
  );
  if (open.size === 0) return "custom";

  for (const preset of ["everyday", "monFri", "weekends"] as const) {
    const days = presetWeekdays(preset);
    if (
      days.length === open.size &&
      days.every((day) => open.has(day))
    ) {
      return preset;
    }
  }
  return "custom";
}
