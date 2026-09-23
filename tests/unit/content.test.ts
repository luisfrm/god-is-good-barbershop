import { beforeEach, describe, expect, it, vi } from "vitest";

const findSection = vi.fn();
const upsertSection = vi.fn();

vi.mock("@/server/repositories/content", () => ({
  findSection: (...args: unknown[]) => findSection(...args),
  upsertSection: (...args: unknown[]) => upsertSection(...args),
}));

import { getContentOrThrow, saveContent } from "@/server/services/content";

beforeEach(() => {
  findSection.mockReset();
  upsertSection.mockReset();
});

describe("getContentOrThrow", () => {
  it("parses valid JSON row", async () => {
    findSection.mockResolvedValueOnce({
      section: "site.meta",
      data: JSON.stringify({ name: "Gods Good" }),
      updated_at: "2026-01-01T00:00:00Z",
    });
    const data = await getContentOrThrow("site.meta");
    expect(data).toEqual({ name: "Gods Good" });
  });

  it("throws when row is missing (no silent fallback)", async () => {
    findSection.mockResolvedValueOnce(null);
    await expect(getContentOrThrow("site.meta")).rejects.toThrow(
      /CMS section "site\.meta" is missing/
    );
  });

  it("throws when JSON is invalid", async () => {
    findSection.mockResolvedValueOnce({
      section: "site.meta",
      data: "{broken",
      updated_at: "2026-01-01T00:00:00Z",
    });
    await expect(getContentOrThrow("site.meta")).rejects.toThrow(
      /invalid JSON/
    );
  });
});

describe("saveContent", () => {
  it("serializes data and upserts", async () => {
    await saveContent("site.nav", {
      items: [{ text: "Inicio", href: "#home" }],
    });
    expect(upsertSection).toHaveBeenCalledWith(
      "site.nav",
      JSON.stringify({ items: [{ text: "Inicio", href: "#home" }] })
    );
  });
});
