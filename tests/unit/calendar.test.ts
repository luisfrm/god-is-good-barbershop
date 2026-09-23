import { describe, expect, it } from "vitest";
import {
  dayOfMonth,
  firstDateOfMonth,
  formatMonthLabel,
  isMonthKey,
  lastDateOfMonth,
  monthGrid,
  monthKeyFromDateKey,
  parseMonthKey,
  shiftMonthKey,
} from "@/server/scheduling/calendar";

describe("isMonthKey / parseMonthKey", () => {
  it("accepts YYYY-MM and rejects others", () => {
    expect(isMonthKey("2026-09")).toBe(true);
    expect(isMonthKey("2026-13")).toBe(false);
    expect(isMonthKey("2026-9")).toBe(false);
    expect(isMonthKey("nope")).toBe(false);
  });

  it("falls back when invalid or missing", () => {
    expect(parseMonthKey("2026-03", "2026-09")).toBe("2026-03");
    expect(parseMonthKey(undefined, "2026-09")).toBe("2026-09");
    expect(parseMonthKey("bad", "2026-09")).toBe("2026-09");
  });
});

describe("shiftMonthKey", () => {
  it("moves across year boundaries", () => {
    expect(shiftMonthKey("2026-01", -1)).toBe("2025-12");
    expect(shiftMonthKey("2026-12", 1)).toBe("2027-01");
    expect(shiftMonthKey("2026-09", 1)).toBe("2026-10");
  });
});

describe("month boundaries", () => {
  it("returns first and last dates", () => {
    expect(firstDateOfMonth("2026-02")).toBe("2026-02-01");
    expect(lastDateOfMonth("2026-02")).toBe("2026-02-28");
    expect(lastDateOfMonth("2024-02")).toBe("2024-02-29");
    expect(lastDateOfMonth("2026-09")).toBe("2026-09-30");
  });
});

describe("formatMonthLabel", () => {
  it("renders a Spanish month label", () => {
    expect(formatMonthLabel("2026-09")).toBe("Septiembre 2026");
    expect(formatMonthLabel("2026-01")).toBe("Enero 2026");
  });
});

describe("monthGrid", () => {
  it("returns 42 Monday-first cells covering the month", () => {
    // 2026-09-01 is a Tuesday → grid starts Monday 2026-08-31
    const cells = monthGrid("2026-09");
    expect(cells).toHaveLength(42);
    expect(cells[0].date).toBe("2026-08-31");
    expect(cells[0].inMonth).toBe(false);
    expect(cells[1].date).toBe("2026-09-01");
    expect(cells[1].inMonth).toBe(true);
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30);
  });

  it("handles a month starting on Monday", () => {
    // 2026-06-01 is a Monday
    const cells = monthGrid("2026-06");
    expect(cells[0].date).toBe("2026-06-01");
    expect(cells[0].inMonth).toBe(true);
  });
});

describe("dayOfMonth / monthKeyFromDateKey", () => {
  it("extracts parts of a date key", () => {
    expect(dayOfMonth("2026-09-05")).toBe(5);
    expect(monthKeyFromDateKey("2026-09-05")).toBe("2026-09");
  });
});
