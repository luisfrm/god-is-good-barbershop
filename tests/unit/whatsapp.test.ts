import { describe, expect, it } from "vitest";
import { normalizePhoneForWhatsapp, whatsappLink } from "@/lib/whatsapp";

describe("normalizePhoneForWhatsapp", () => {
  it("keeps digits only", () => {
    expect(normalizePhoneForWhatsapp("+58 424-000-0000")).toBe("584240000000");
    expect(normalizePhoneForWhatsapp("(0424) 000 0000")).toBe("04240000000");
  });
});

describe("whatsappLink", () => {
  it("builds a basic wa.me link", () => {
    expect(whatsappLink("+58 424 000 0000")).toBe("https://wa.me/584240000000");
  });

  it("appends an encoded message", () => {
    expect(whatsappLink("4240000000", "Hola Ana")).toBe(
      "https://wa.me/4240000000?text=Hola%20Ana"
    );
  });

  it("returns empty string without digits", () => {
    expect(whatsappLink("—")).toBe("");
    expect(whatsappLink("")).toBe("");
  });
});
