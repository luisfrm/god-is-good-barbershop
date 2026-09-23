import { describe, expect, it } from "vitest";
import {
  buildScheduleForPreset,
  detectSchedulePreset,
  presetWeekdays,
} from "@/server/scheduling/presets";
import type { WorkDaySchedule } from "@/types/scheduling";

describe("presetWeekdays", () => {
  it("returns all seven days for everyday", () => {
    expect(presetWeekdays("everyday")).toHaveLength(7);
  });

  it("returns monday..friday for monFri", () => {
    expect(presetWeekdays("monFri")).toEqual([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
    ]);
  });

  it("returns saturday and sunday for weekends", () => {
    expect(presetWeekdays("weekends")).toEqual(["saturday", "sunday"]);
  });

  it("returns nothing for custom", () => {
    expect(presetWeekdays("custom")).toEqual([]);
  });
});

describe("buildScheduleForPreset", () => {
  it("opens the preset days with the given range", () => {
    const schedule = buildScheduleForPreset("monFri", {
      start: "10:00",
      end: "19:00",
    });
    expect(schedule).toHaveLength(5);
    expect(schedule.every((d) => d.ranges.length === 1)).toBe(true);
    expect(schedule[0]).toEqual({
      day: "monday",
      ranges: [{ start: "10:00", end: "19:00" }],
    });
  });

  it("defaults to 09:00-18:00", () => {
    const schedule = buildScheduleForPreset("weekends");
    expect(schedule[0].ranges[0]).toEqual({ start: "09:00", end: "18:00" });
  });

  it("keeps the current schedule for custom", () => {
    const current: WorkDaySchedule[] = [
      { day: "monday", ranges: [{ start: "08:00", end: "12:00" }] },
    ];
    expect(buildScheduleForPreset("custom", undefined, current)).toBe(current);
  });
});

describe("detectSchedulePreset", () => {
  const open = (days: WorkDaySchedule["day"][]): WorkDaySchedule[] =>
    days.map((day) => ({ day, ranges: [{ start: "09:00", end: "18:00" }] }));

  it("detects everyday", () => {
    expect(
      detectSchedulePreset(
        open([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ])
      )
    ).toBe("everyday");
  });

  it("detects monFri", () => {
    expect(
      detectSchedulePreset(
        open(["monday", "tuesday", "wednesday", "thursday", "friday"])
      )
    ).toBe("monFri");
  });

  it("detects weekends", () => {
    expect(detectSchedulePreset(open(["saturday", "sunday"]))).toBe("weekends");
  });

  it("falls back to custom for mixed sets and empty", () => {
    expect(detectSchedulePreset(open(["monday", "saturday"]))).toBe("custom");
    expect(detectSchedulePreset([])).toBe("custom");
  });

  it("round-trips every preset", () => {
    for (const preset of ["everyday", "monFri", "weekends"] as const) {
      expect(detectSchedulePreset(buildScheduleForPreset(preset))).toBe(preset);
    }
  });
});
