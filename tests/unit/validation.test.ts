import { describe, expect, it } from "vitest";
import { calculateSlotEndTime } from "@/server/scheduling/validation";

describe("calculateSlotEndTime", () => {
  it("adds duration to start", () => {
    expect(calculateSlotEndTime("09:00", 45)).toBe("09:45");
    expect(calculateSlotEndTime("17:30", 45)).toBe("18:15");
  });

  it("crosses hour boundaries", () => {
    expect(calculateSlotEndTime("11:30", 45)).toBe("12:15");
  });

  it("returns input when start is invalid", () => {
    expect(calculateSlotEndTime("bad", 45)).toBe("bad");
  });
});
