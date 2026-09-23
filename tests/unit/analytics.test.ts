import { describe, expect, it } from "vitest";
import {
  averagePerDay,
  buildDailySeries,
  buildHourlyLoad,
  buildStatusDistribution,
  cancellationRate,
  completionRate,
  dateRangeKeys,
  formatShortDate,
  occupancyPercent,
  percentChange,
  shiftDateKey,
  statusDistributionFromCounts,
} from "@/server/scheduling/analytics";

describe("shiftDateKey", () => {
  it("moves forward and backward across month/year bounds", () => {
    expect(shiftDateKey("2026-09-23", 1)).toBe("2026-09-24");
    expect(shiftDateKey("2026-09-01", -1)).toBe("2026-08-31");
    expect(shiftDateKey("2026-01-01", -1)).toBe("2025-12-31");
    expect(shiftDateKey("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("returns the input for invalid dates", () => {
    expect(shiftDateKey("nope", 1)).toBe("nope");
  });
});

describe("dateRangeKeys", () => {
  it("returns consecutive keys ending today", () => {
    const keys = dateRangeKeys("2026-09-23", 3);
    expect(keys).toEqual(["2026-09-21", "2026-09-22", "2026-09-23"]);
  });

  it("always returns at least one key", () => {
    expect(dateRangeKeys("2026-09-23", 0)).toEqual(["2026-09-23"]);
  });
});

describe("buildDailySeries", () => {
  const keys = ["2026-09-21", "2026-09-22", "2026-09-23"];

  it("buckets appointments by date and status", () => {
    const series = buildDailySeries(
      [
        { date: "2026-09-21", status: "completed" },
        { date: "2026-09-21", status: "cancelled" },
        { date: "2026-09-23", status: "pending" },
      ],
      keys
    );

    expect(series).toHaveLength(3);
    expect(series[0]).toMatchObject({ total: 2, completed: 1, cancelled: 1 });
    expect(series[1].total).toBe(0);
    expect(series[2]).toMatchObject({ total: 1, pending: 1 });
  });

  it("ignores appointments outside the window", () => {
    const series = buildDailySeries(
      [{ date: "2020-01-01", status: "pending" }],
      keys
    );
    expect(series.every((day) => day.total === 0)).toBe(true);
  });
});

describe("status distribution", () => {
  it("computes counts and percentages", () => {
    const slices = buildStatusDistribution([
      { status: "pending" },
      { status: "confirmed" },
      { status: "confirmed" },
      { status: "cancelled" },
    ]);
    const confirmed = slices.find((s) => s.status === "confirmed");
    expect(confirmed?.count).toBe(2);
    expect(confirmed?.percent).toBe(50);
    expect(slices.reduce((sum, s) => sum + s.count, 0)).toBe(4);
  });

  it("builds from raw counts (all-time)", () => {
    const slices = statusDistributionFromCounts({
      pending: 1,
      confirmed: 1,
      completed: 8,
    });
    expect(slices.find((s) => s.status === "completed")?.percent).toBe(80);
    expect(slices.find((s) => s.status === "cancelled")?.percent).toBe(0);
  });

  it("handles an empty dataset", () => {
    const slices = buildStatusDistribution([]);
    expect(slices.every((s) => s.percent === 0)).toBe(true);
  });
});

describe("buildHourlyLoad", () => {
  it("orders hours by demand and applies the limit", () => {
    const load = buildHourlyLoad(
      [
        { start_time: "09:00" },
        { start_time: "09:30" },
        { start_time: "10:00" },
        { start_time: "17:00" },
      ],
      2
    );
    expect(load).toHaveLength(2);
    expect(load[0]).toEqual({ hour: 9, label: "09:00", count: 2 });
    expect(load[1].hour).toBe(10);
  });

  it("returns an empty list without appointments", () => {
    expect(buildHourlyLoad([])).toEqual([]);
  });
});

describe("rates and helpers", () => {
  it("computes percent change", () => {
    expect(percentChange(12, 10)).toBe(20);
    expect(percentChange(5, 10)).toBe(-50);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(4, 0)).toBeNull();
  });

  it("computes occupancy safely", () => {
    expect(occupancyPercent(25, 50)).toBe(50);
    expect(occupancyPercent(1, 0)).toBe(0);
  });

  it("excludes cancelled appointments from the completion rate", () => {
    expect(completionRate(8, 10, 2)).toBe(100);
    expect(completionRate(4, 10, 0)).toBe(40);
    expect(completionRate(0, 0, 0)).toBe(0);
  });

  it("computes cancellation rate and daily average", () => {
    expect(cancellationRate(2, 10)).toBe(20);
    expect(cancellationRate(0, 0)).toBe(0);
    expect(averagePerDay(21, 14)).toBe(1.5);
    expect(averagePerDay(5, 0)).toBe(0);
  });

  it("formats short dates", () => {
    expect(formatShortDate("2026-09-23")).toBe("23/9");
  });
});
