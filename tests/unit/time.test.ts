import { describe, expect, it } from "vitest";
import {
  areRangesValid,
  formatTimeLabel,
  isRangeValid,
  minutesToTime,
  normalizeTime,
  timeToMinutes,
} from "@/server/scheduling/time";

describe("timeToMinutes", () => {
  it("parses valid HH:mm", () => {
    expect(timeToMinutes("00:00")).toBe(0);
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("23:59")).toBe(1439);
  });

  it("trims whitespace", () => {
    expect(timeToMinutes(" 09:00 ")).toBe(540);
  });

  it("rejects invalid input", () => {
    expect(timeToMinutes("24:00")).toBeNull();
    expect(timeToMinutes("12:60")).toBeNull();
    expect(timeToMinutes("9:0")).toBeNull();
    expect(timeToMinutes("abc")).toBeNull();
    expect(timeToMinutes("")).toBeNull();
  });
});

describe("minutesToTime", () => {
  it("formats padded HH:mm", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(540)).toBe("09:00");
    expect(minutesToTime(1439)).toBe("23:59");
  });

  it("clamps out-of-range values", () => {
    expect(minutesToTime(-10)).toBe("00:00");
    expect(minutesToTime(2000)).toBe("23:59");
  });
});

describe("formatTimeLabel", () => {
  it("renders 12h labels", () => {
    expect(formatTimeLabel("09:00")).toBe("9:00 AM");
    expect(formatTimeLabel("12:00")).toBe("12:00 PM");
    expect(formatTimeLabel("00:30")).toBe("12:30 AM");
    expect(formatTimeLabel("18:45")).toBe("6:45 PM");
  });

  it("returns input when unparseable", () => {
    expect(formatTimeLabel("nope")).toBe("nope");
  });
});

describe("normalizeTime", () => {
  it("strips seconds", () => {
    expect(normalizeTime("09:00:00")).toBe("09:00");
    expect(normalizeTime("09:00")).toBe("09:00");
    expect(normalizeTime(" 10:15:30 ")).toBe("10:15");
  });
});

describe("isRangeValid / areRangesValid", () => {
  it("accepts end after start", () => {
    expect(isRangeValid({ start: "09:00", end: "10:00" })).toBe(true);
  });

  it("rejects empty or inverted ranges", () => {
    expect(isRangeValid({ start: "10:00", end: "09:00" })).toBe(false);
    expect(isRangeValid({ start: "09:00", end: "09:00" })).toBe(false);
    expect(isRangeValid({ start: "bad", end: "10:00" })).toBe(false);
  });

  it("requires at least one valid range", () => {
    expect(areRangesValid([])).toBe(false);
    expect(areRangesValid([{ start: "09:00", end: "10:00" }])).toBe(true);
    expect(
      areRangesValid([
        { start: "09:00", end: "10:00" },
        { start: "11:00", end: "10:00" },
      ])
    ).toBe(false);
  });
});
