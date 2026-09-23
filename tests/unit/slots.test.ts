import { describe, expect, it } from "vitest";
import {
  applyBlockedDates,
  buildAvailability,
  formatSlotLabel,
  generateSlots,
  getRangesForWeekday,
  markBookedSlots,
  weekdayOfDateKey,
  zonedDateKey,
} from "@/server/scheduling/slots";
import type { WorkDaySchedule } from "@/types/scheduling";

const workHours: WorkDaySchedule[] = [
  { day: "tuesday", ranges: [{ start: "09:00", end: "18:00" }] },
  { day: "wednesday", ranges: [{ start: "09:00", end: "13:00" }] },
];

describe("weekdayOfDateKey", () => {
  it("maps ISO dates to weekdays", () => {
    expect(weekdayOfDateKey("2026-09-22")).toBe("tuesday");
    expect(weekdayOfDateKey("2026-09-21")).toBe("monday");
    expect(weekdayOfDateKey("2026-09-27")).toBe("sunday");
  });
});

describe("zonedDateKey", () => {
  it("formats a date key in the given timezone", () => {
    const date = new Date("2026-09-22T12:00:00Z");
    expect(zonedDateKey(date, "UTC")).toBe("2026-09-22");
    expect(zonedDateKey(date, "America/Caracas")).toBe("2026-09-22");
  });
});

describe("getRangesForWeekday", () => {
  it("returns ranges for known day", () => {
    expect(getRangesForWeekday(workHours, "tuesday")).toHaveLength(1);
  });

  it("returns empty for missing day", () => {
    expect(getRangesForWeekday(workHours, "monday")).toEqual([]);
  });
});

describe("generateSlots", () => {
  it("steps slots by session duration within ranges", () => {
    // 2026-09-22 is a Tuesday: open 09:00-18:00, duration 45m
    const days = generateSlots(
      workHours,
      "UTC",
      45,
      new Date("2026-09-22T00:00:00Z"),
      1
    );
    expect(days).toHaveLength(1);
    expect(days[0].weekday).toBe("tuesday");
    expect(days[0].slots[0]).toEqual({
      start: "09:00",
      end: "09:45",
      booked: false,
    });
    // last start with +45 <= 18:00 → 17:15
    expect(days[0].slots.at(-1)).toEqual({
      start: "17:15",
      end: "18:00",
      booked: false,
    });
    // (18:00 - 09:00 = 540) / 45 = 12 slots
    expect(days[0].slots).toHaveLength(12);
  });

  it("emits empty slots for closed days", () => {
    const days = generateSlots(
      workHours,
      "UTC",
      45,
      new Date("2026-09-21T00:00:00Z"), // Monday closed
      1
    );
    expect(days[0].slots).toEqual([]);
  });

  it("respects multiple days count", () => {
    const days = generateSlots(
      workHours,
      "UTC",
      45,
      new Date("2026-09-22T00:00:00Z"),
      3
    );
    expect(days.map((d) => d.date)).toEqual([
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
    ]);
  });
});

describe("markBookedSlots / buildAvailability", () => {
  it("marks matching non-cancelled appointments as booked", () => {
    const days = generateSlots(
      workHours,
      "UTC",
      45,
      new Date("2026-09-22T00:00:00Z"),
      1
    );
    const marked = markBookedSlots(days, [
      { date: "2026-09-22", start_time: "09:00", status: "pending" },
      { date: "2026-09-22", start_time: "09:45", status: "cancelled" },
    ]);
    expect(marked[0].slots[0].booked).toBe(true);
    expect(marked[0].slots[1].booked).toBe(false);
  });

  it("buildAvailability wires generate + mark", () => {
    const out = buildAvailability(
      workHours,
      "UTC",
      45,
      new Date("2026-09-22T00:00:00Z"),
      1,
      [{ date: "2026-09-22", start_time: "10:30", status: "confirmed" }]
    );
    const slot = out[0].slots.find((s) => s.start === "10:30");
    expect(slot?.booked).toBe(true);
  });
});

describe("formatSlotLabel", () => {
  it("joins start and end with en dash", () => {
    expect(formatSlotLabel({ start: "09:00", end: "09:45", booked: false })).toBe(
      "09:00 – 09:45"
    );
  });
});

describe("applyBlockedDates / buildAvailability", () => {
  it("clears slots for blocked dates but keeps the day", () => {
    const days = generateSlots(
      workHours,
      "UTC",
      45,
      new Date("2026-09-22T00:00:00Z"),
      1
    );
    const blocked = applyBlockedDates(days, ["2026-09-22"]);
    expect(blocked).toHaveLength(1);
    expect(blocked[0].date).toBe("2026-09-22");
    expect(blocked[0].slots).toEqual([]);
  });

  it("leaves other days untouched", () => {
    const days = generateSlots(
      workHours,
      "UTC",
      45,
      new Date("2026-09-22T00:00:00Z"),
      1
    );
    expect(applyBlockedDates(days, ["2026-09-23"])[0].slots).toHaveLength(12);
  });

  it("buildAvailability honours the blocked list (7th arg)", () => {
    const out = buildAvailability(
      workHours,
      "UTC",
      45,
      new Date("2026-09-22T00:00:00Z"),
      2,
      [],
      ["2026-09-22"]
    );
    expect(out[0].slots).toEqual([]);
    expect(out[1].slots.length).toBeGreaterThan(0);
  });
});
