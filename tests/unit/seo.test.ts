import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildAggregateRating,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildLocalBusinessJsonLd,
  buildOpeningHoursSpecification,
  buildOpeningHoursStrings,
  buildSitemapEntries,
  canonicalFor,
  formatDateLabel,
  normalizeBaseUrl,
  toDateOnly,
  truncateDescription,
  PUBLIC_ROUTES,
} from "@/lib/seo";
import type { WorkDaySchedule } from "@/types/scheduling";

const workHours: WorkDaySchedule[] = [
  { day: "monday", ranges: [{ start: "09:00", end: "18:00" }] },
  { day: "saturday", ranges: [{ start: "09:00", end: "13:00" }] },
];

describe("normalizeBaseUrl / absoluteUrl", () => {
  it("strips trailing slashes", () => {
    expect(normalizeBaseUrl("https://barber.com/")).toBe("https://barber.com");
    expect(normalizeBaseUrl("https://barber.com///")).toBe("https://barber.com");
  });

  it("falls back when empty", () => {
    expect(normalizeBaseUrl("   ")).toBe("http://localhost:3000");
  });

  it("builds absolute urls", () => {
    expect(absoluteUrl("/", "https://barber.com/")).toBe("https://barber.com/");
    expect(absoluteUrl("/reservar", "https://barber.com")).toBe(
      "https://barber.com/reservar"
    );
    expect(absoluteUrl("politicas", "https://barber.com")).toBe(
      "https://barber.com/politicas"
    );
  });

  it("exposes canonical urls", () => {
    expect(canonicalFor("/privacidad", "https://barber.com/")).toBe(
      "https://barber.com/privacidad"
    );
  });
});

describe("buildSitemapEntries", () => {
  it("includes every public route with priorities", () => {
    const entries = buildSitemapEntries(
      "https://barber.com",
      "2026-09-23T00:00:00.000Z"
    );
    expect(entries).toHaveLength(PUBLIC_ROUTES.length);
    const paths = entries.map((e) => e.url.replace("https://barber.com", ""));
    expect(paths).toContain("/politicas");
    expect(paths).toContain("/privacidad");
    expect(paths).toContain("/reservar");
    const home = entries.find((e) => e.url === "https://barber.com/");
    expect(home?.priority).toBe(1);
    expect(home?.lastModified).toBe("2026-09-23T00:00:00.000Z");
  });
});

describe("toDateOnly / formatDateLabel", () => {
  it("keeps the date part", () => {
    expect(toDateOnly("2026-09-23T10:00:00.000Z")).toBe("2026-09-23");
    expect(toDateOnly("2026-09-23")).toBe("2026-09-23");
  });

  it("renders a Spanish label", () => {
    expect(formatDateLabel("2026-09-23")).toBe("23 de septiembre de 2026");
    expect(formatDateLabel("2026-01-05T08:00:00Z")).toBe("5 de enero de 2026");
  });
});

describe("truncateDescription", () => {
  it("collapses whitespace and keeps short text", () => {
    expect(truncateDescription("  Hola   mundo ")).toBe("Hola mundo");
  });

  it("cuts on a word boundary with an ellipsis", () => {
    const long = "palabra ".repeat(40).trim();
    const result = truncateDescription(long, 40);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toContain("  ");
  });
});

describe("opening hours", () => {
  it("maps weekdays to schema.org codes", () => {
    const specs = buildOpeningHoursSpecification(workHours);
    expect(specs).toHaveLength(2);
    expect(specs[0]).toEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "https://schema.org/Monday",
      opens: "09:00",
      closes: "18:00",
    });
    expect(specs[1].dayOfWeek).toBe("https://schema.org/Saturday");
  });

  it("builds compact openingHours strings in week order", () => {
    expect(buildOpeningHoursStrings(workHours)).toEqual([
      "Mo 09:00-18:00",
      "Sa 09:00-13:00",
    ]);
  });
});

describe("buildLocalBusinessJsonLd", () => {
  it("includes contact, address and opening hours", () => {
    const json = buildLocalBusinessJsonLd({
      name: "Gods Good BarberShop",
      description: "Barbería clásica",
      url: "https://barber.com/",
      telephone: "+584246248690",
      email: "info@barber.com",
      address: "Calle 89",
      mapsUrl: "https://maps.app.goo.gl/x",
      since: 2024,
      workHours,
    });

    expect(json["@type"]).toBe("HairSalon");
    expect(json.url).toBe("https://barber.com/");
    expect(json.telephone).toBe("+584246248690");
    expect(json.foundingDate).toBe("2024");
    expect(json.openingHours).toEqual(["Mo 09:00-18:00", "Sa 09:00-13:00"]);
    expect(json.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Calle 89",
      addressCountry: "VE",
    });
  });

  it("omits optional blocks when data is missing", () => {
    const json = buildLocalBusinessJsonLd({
      name: "Barber",
      description: "d",
      url: "https://barber.com",
    });
    expect(json.telephone).toBeUndefined();
    expect(json.openingHours).toBeUndefined();
    expect(json.aggregateRating).toBeUndefined();
    expect(json.priceRange).toBe("$$");
  });
});

describe("buildAggregateRating", () => {
  it("averages valid ratings only", () => {
    const rating = buildAggregateRating([
      { author: "a", meta: "", rating: 5, text: "" },
      { author: "b", meta: "", rating: 4, text: "" },
      { author: "c", meta: "", rating: 0, text: "" },
    ]);
    expect(rating).toMatchObject({ ratingValue: 4.5, reviewCount: 2 });
  });

  it("returns null without usable ratings", () => {
    expect(buildAggregateRating([])).toBeNull();
  });
});

describe("buildFaqJsonLd", () => {
  it("builds a FAQPage from non-empty items", () => {
    const json = buildFaqJsonLd([
      { question: "¿Necesito cita?", answer: "Recomendado." },
      { question: "", answer: "sin pregunta" },
    ]);
    expect(json?.["@type"]).toBe("FAQPage");
    const entities = json?.mainEntity as { name: string }[];
    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("¿Necesito cita?");
  });

  it("returns null when there is nothing usable", () => {
    expect(buildFaqJsonLd([])).toBeNull();
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numbers crumbs from 1", () => {
    const json = buildBreadcrumbJsonLd(
      [
        { name: "Inicio", path: "/" },
        { name: "Privacidad", path: "/privacidad" },
      ],
      "https://barber.com/"
    );
    const items = json.itemListElement as { position: number; item: string }[];
    expect(items[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: "https://barber.com/",
    });
    expect(items[1].position).toBe(2);
  });
});
