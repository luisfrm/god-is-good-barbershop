import { describe, expect, it } from "vitest";
import {
  CMS_SECTION_GROUPS,
  CMS_SECTION_KEYS,
  CMS_SECTION_LABELS,
  cmsSectionLabel,
  isCmsSectionKey,
} from "@/types/cms";

describe("CMS section registry", () => {
  it("recognizes known sections and rejects unknown ones", () => {
    expect(isCmsSectionKey("home.faq")).toBe(true);
    expect(isCmsSectionKey("legal.privacy")).toBe(true);
    expect(isCmsSectionKey("home.unknown")).toBe(false);
    expect(isCmsSectionKey("")).toBe(false);
  });

  it("has a label for every key", () => {
    for (const key of CMS_SECTION_KEYS) {
      expect(CMS_SECTION_LABELS[key]).toBeTruthy();
    }
  });

  it("falls back to the raw key for unknown sections", () => {
    expect(cmsSectionLabel("home.faq")).toBe("Inicio · Preguntas frecuentes");
    expect(cmsSectionLabel("nope")).toBe("nope");
  });

  it("groups every section exactly once", () => {
    const grouped = CMS_SECTION_GROUPS.flatMap((group) => group.keys);
    expect(grouped.sort()).toEqual([...CMS_SECTION_KEYS].sort());
    expect(new Set(grouped).size).toBe(grouped.length);
  });

  it("keeps the legal pages in their own group", () => {
    const legal = CMS_SECTION_GROUPS.find((g) => g.title === "Legal");
    expect(legal?.keys).toEqual(["legal.terms", "legal.privacy"]);
  });
});
