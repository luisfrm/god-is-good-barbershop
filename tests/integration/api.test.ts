import { describe, expect, it } from "vitest";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3010";

async function get(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: "manual",
    ...init,
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { res, text, json };
}

describe("GET /api/availability", () => {
  it("returns 200 with PublicAvailability shape", async () => {
    const { res, json } = await get("/api/availability?days=7");
    expect(res.status).toBe(200);
    const body = json as {
      timezone: string;
      sessionDuration: number;
      days: { date: string; weekday: string; slots: unknown[] }[];
    };
    expect(body).toHaveProperty("timezone");
    expect(body).toHaveProperty("sessionDuration");
    expect(Array.isArray(body.days)).toBe(true);
    expect(body.days.length).toBe(7);
    for (const day of body.days) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Array.isArray(day.slots)).toBe(true);
      for (const slot of day.slots as { start: string; end: string; booked: boolean }[]) {
        expect(slot.start).toMatch(/^\d{2}:\d{2}$/);
        expect(slot.end).toMatch(/^\d{2}:\d{2}$/);
        expect(typeof slot.booked).toBe("boolean");
      }
    }
  });

  it("clamps invalid days to default", async () => {
    const { res, json } = await get("/api/availability?days=abc");
    expect(res.status).toBe(200);
    expect((json as { days: unknown[] }).days).toHaveLength(14);
  });
});

describe("public site & SEO routes", () => {
  it("serves the marketing pages statically", async () => {
    for (const path of ["/", "/politicas", "/privacidad", "/reservar"]) {
      const { res } = await get(path);
      expect(res.status, `${path} should be 200`).toBe(200);
    }
  });

  it("publishes a sitemap with the legal pages", async () => {
    const { res, text } = await get("/sitemap.xml");
    expect(res.status).toBe(200);
    expect(text).toContain("<urlset");
    expect(text).toContain("/politicas");
    expect(text).toContain("/privacidad");
  });

  it("keeps the panel out of robots.txt", async () => {
    const { res, text } = await get("/robots.txt");
    expect(res.status).toBe(200);
    expect(text).toContain("Disallow: /panel");
    expect(text).toContain("Sitemap:");
  });

  it("exposes LocalBusiness and FAQ structured data on the home page", async () => {
    const { text } = await get("/");
    expect(text).toContain('"@type":"HairSalon"');
    expect(text).toContain('"@type":"FAQPage"');
  });
});

describe("panel auth gate", () => {
  it("redirects /panel/dashboard without cookie to login", async () => {
    const { res } = await get("/panel/dashboard");
    expect([302, 307]).toContain(res.status);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/panel/login");
  });

  it("allows /panel/login without cookie", async () => {
    const { res, text } = await get("/panel/login");
    expect(res.status).toBe(200);
    // Title or body contains login form text (encoding-safe)
    const lower = text.toLowerCase();
    expect(lower.includes("iniciar") || lower.includes("email")).toBe(true);
  });

  it("allows /panel/register without cookie (200 or bootstrap redirect to login)", async () => {
    const { res } = await get("/panel/register");
    // 200 when no users yet; 307 to /panel/login when admin already exists
    expect([200, 302, 307]).toContain(res.status);
    if (res.status !== 200) {
      const location = res.headers.get("location") ?? "";
      expect(location).toContain("/panel/login");
    }
  });
});

describe("POST /api/appointments validation", () => {
  it("returns 400 for missing required fields", async () => {
    const { res, json } = await get("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", email: "", phone: "" }),
    });
    expect(res.status).toBe(400);
    expect(json).toHaveProperty("error");
  });

  it("returns 400 for invalid date", async () => {
    const { res, json } = await get("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test",
        email: "test@example.com",
        phone: "0000",
        date: "not-a-date",
        start_time: "09:00",
        end_time: "09:45",
        timezone: "America/Caracas",
      }),
    });
    expect(res.status).toBe(400);
    expect((json as { error: string }).error).toMatch(/Fecha|horario|disponible/i);
  });
});
