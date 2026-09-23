import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GOOGLE_REDIRECT_PATH,
  GOOGLE_SCOPE,
  buildAuthUrl,
  buildEventPayload,
  generateOAuthState,
  getAppUrl,
  getRedirectUri,
  hasGoogleCredentials,
  isTokenExpired,
} from "@/server/services/google";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAppUrl / getRedirectUri", () => {
  it("uses env and strips trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://example.com/");
    expect(getAppUrl()).toBe("https://example.com");
    expect(getRedirectUri()).toBe(
      `https://example.com${GOOGLE_REDIRECT_PATH}`
    );
  });

  it("falls back to localhost:3000", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(getAppUrl()).toBe("http://localhost:3000");
  });
});

describe("hasGoogleCredentials", () => {
  it("true only when both env vars set", () => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
    expect(hasGoogleCredentials()).toBe(true);

    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
    expect(hasGoogleCredentials()).toBe(false);
  });
});

describe("generateOAuthState", () => {
  it("returns 64 hex chars and differs between calls", () => {
    const a = generateOAuthState();
    const b = generateOAuthState();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(b).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
  });
});

describe("buildAuthUrl", () => {
  it("builds Google OAuth URL with required params", () => {
    const url = new URL(
      buildAuthUrl({
        clientId: "cid",
        redirectUri: "https://app.test/api/google/callback",
        state: "abc123",
      })
    );
    expect(url.origin + url.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    expect(url.searchParams.get("client_id")).toBe("cid");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("state")).toBe("abc123");
    expect(url.searchParams.get("scope")).toBe(GOOGLE_SCOPE);
    expect(url.searchParams.get("prompt")).toBe("consent");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://app.test/api/google/callback"
    );
  });
});

describe("buildEventPayload", () => {
  it("includes required calendar fields and optional attendee", () => {
    const payload = buildEventPayload({
      summary: "Cita — Ana",
      startDateTime: "2026-09-22T09:00:00",
      endDateTime: "2026-09-22T09:45:00",
      timeZone: "America/Caracas",
      attendeeEmail: "ana@test.com",
      location: "Calle 1",
      description: "Hola",
    });
    expect(payload.summary).toBe("Cita — Ana");
    expect(payload.start).toEqual({
      dateTime: "2026-09-22T09:00:00",
      timeZone: "America/Caracas",
    });
    expect(payload.end).toEqual({
      dateTime: "2026-09-22T09:45:00",
      timeZone: "America/Caracas",
    });
    expect(payload.attendees).toEqual([{ email: "ana@test.com" }]);
    expect(payload.location).toBe("Calle 1");
    expect(payload.description).toBe("Hola");
  });

  it("omits optional fields when absent", () => {
    const payload = buildEventPayload({
      summary: "S",
      startDateTime: "2026-09-22T09:00:00",
      endDateTime: "2026-09-22T09:45:00",
      timeZone: "UTC",
    });
    expect(payload.attendees).toBeUndefined();
    expect(payload.description).toBeUndefined();
    expect(payload.location).toBeUndefined();
  });
});

describe("isTokenExpired", () => {
  const base = {
    access_token: "t",
    refresh_token: null,
    scope: "",
    token_type: "Bearer",
    email: null,
  };

  it("expires when within skew", () => {
    const now = Date.now();
    expect(
      isTokenExpired({ ...base, expires_at: now + 30_000 }, 60_000)
    ).toBe(true);
  });

  it("valid when far in the future", () => {
    const now = Date.now();
    expect(
      isTokenExpired({ ...base, expires_at: now + 3_600_000 }, 60_000)
    ).toBe(false);
  });
});
