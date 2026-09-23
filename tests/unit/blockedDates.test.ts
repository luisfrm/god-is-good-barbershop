import { describe, expect, it } from "vitest";
import { blockedDateSet, isValidDateKey } from "@/server/services/blockedDates";

describe("isValidDateKey", () => {
  it("accepts real ISO dates", () => {
    expect(isValidDateKey("2026-09-22")).toBe(true);
    expect(isValidDateKey("2024-02-29")).toBe(true);
  });

  it("rejects malformed or impossible dates", () => {
    expect(isValidDateKey("2026-9-22")).toBe(false);
    expect(isValidDateKey("2026-13-01")).toBe(false);
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("nope")).toBe(false);
  });
});

describe("blockedDateSet", () => {
  it("builds a lookup set of dates", () => {
    const set = blockedDateSet([
      { date: "2026-09-22", reason: "", created_at: "" },
      { date: "2026-12-25", reason: "Navidad", created_at: "" },
    ]);
    expect(set.has("2026-09-22")).toBe(true);
    expect(set.has("2026-09-23")).toBe(false);
    expect(set.size).toBe(2);
  });
});
