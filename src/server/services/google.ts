import type { GoogleTokens } from "@/types/scheduling";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export const GOOGLE_SCOPE = "https://www.googleapis.com/auth/calendar.events";
export const GOOGLE_REDIRECT_PATH = "/api/google/callback";

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function getRedirectUri(): string {
  return `${getAppUrl()}${GOOGLE_REDIRECT_PATH}`;
}

export function hasGoogleCredentials(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}

/** Random 64-char hex state (Web Crypto — workers compatible). */
export function generateOAuthState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string;
}): string {
  const query = new URLSearchParams({
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    response_type: "code",
    scope: params.scope ?? GOOGLE_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: params.state,
  });
  return `${GOOGLE_AUTH_URL}?${query.toString()}`;
}

export function buildEventPayload(params: {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendeeEmail?: string;
}): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    summary: params.summary,
    start: { dateTime: params.startDateTime, timeZone: params.timeZone },
    end: { dateTime: params.endDateTime, timeZone: params.timeZone },
  };
  if (params.description) payload.description = params.description;
  if (params.location) payload.location = params.location;
  if (params.attendeeEmail) {
    payload.attendees = [{ email: params.attendeeEmail }];
  }
  return payload;
}

export function isTokenExpired(
  tokens: GoogleTokens,
  skewMs = 60_000
): boolean {
  return tokens.expires_at <= Date.now() + skewMs;
}

function normalizeTokens(raw: {
  access_token: string;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string;
  expires_in?: number;
  email?: string | null;
}): GoogleTokens {
  return {
    access_token: raw.access_token,
    refresh_token: raw.refresh_token ?? null,
    scope: raw.scope ?? "",
    token_type: raw.token_type ?? "Bearer",
    expires_at: Date.now() + (raw.expires_in ?? 3600) * 1000,
    email: raw.email ?? null,
  };
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar is not configured (missing env vars)");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const json = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      (json.error_description as string) ||
      (json.error as string) ||
      "Failed to exchange authorization code";
    throw new Error(message);
  }

  return normalizeTokens(json as Parameters<typeof normalizeTokens>[0]);
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<GoogleTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar is not configured (missing env vars)");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const json = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      (json.error_description as string) ||
      (json.error as string) ||
      "Failed to refresh token";
    throw new Error(message);
  }

  const tokens = normalizeTokens(json as Parameters<typeof normalizeTokens>[0]);
  if (!tokens.refresh_token) {
    tokens.refresh_token = refreshToken;
  }
  return tokens;
}

export async function createCalendarEvent(
  accessToken: string,
  payload: Record<string, unknown>
): Promise<{ id: string }> {
  const response = await fetch(GOOGLE_CALENDAR_EVENTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await response.json()) as {
    id?: string;
    error?: { message?: string };
  };
  if (!response.ok || !json.id) {
    throw new Error(
      json.error?.message ?? "Failed to create Google Calendar event"
    );
  }
  return { id: json.id };
}
