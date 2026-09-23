import {
  findSettings,
  updateSettings,
  type SettingsUpdate,
} from "@/server/repositories/settings";
import type {
  SettingsBusiness,
  SettingsRow,
  SettingsScheduling,
} from "@/server/models";
import type { GoogleTokens, WorkDaySchedule } from "@/types/scheduling";
import {
  DEFAULT_SESSION_DURATION,
  DEFAULT_TIMEZONE,
} from "@/types/scheduling";

function parseJson<T>(raw: string | null, label: string): T {
  if (!raw) throw new Error(`Settings field "${label}" is empty.`);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Settings field "${label}" contains invalid JSON.`);
  }
}

export async function requireSettingsRow(): Promise<SettingsRow> {
  const row = await findSettings();
  if (!row) {
    throw new Error(
      "Settings row is missing. Run `pnpm db:migrate:local` to apply migrations/seeds."
    );
  }
  return row;
}

export async function getBusinessSettings(): Promise<SettingsBusiness> {
  const row = await requireSettingsRow();
  return {
    businessName: row.business_name,
    shortName: row.short_name,
    slogan: row.slogan,
    tagline: row.tagline,
    description: row.description,
    since: row.since,
    phone: row.phone,
    phoneDisplay: row.phone_display,
    whatsappUrl: row.whatsapp_url,
    email: row.email,
    address: row.address,
    mapsUrl: row.maps_url,
  };
}

export async function getSchedulingSettings(): Promise<SettingsScheduling> {
  const row = await requireSettingsRow();
  const workHours = parseJson<WorkDaySchedule[]>(row.work_hours, "work_hours");
  return {
    workHours,
    timezone: row.timezone || DEFAULT_TIMEZONE,
    sessionDuration:
      row.session_duration > 0
        ? row.session_duration
        : DEFAULT_SESSION_DURATION,
  };
}

export async function getGoogleTokens(): Promise<GoogleTokens | null> {
  const row = await requireSettingsRow();
  if (!row.google_tokens) return null;
  return parseJson<GoogleTokens>(row.google_tokens, "google_tokens");
}

export async function saveBusinessSettings(
  input: SettingsBusiness
): Promise<void> {
  await updateSettings({
    business_name: input.businessName.trim(),
    short_name: input.shortName.trim(),
    slogan: input.slogan.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    since: Number(input.since) || new Date().getFullYear(),
    phone: input.phone.trim(),
    phone_display: input.phoneDisplay.trim(),
    whatsapp_url: input.whatsappUrl.trim(),
    email: input.email.trim(),
    address: input.address.trim(),
    maps_url: input.mapsUrl.trim(),
  });
}

export async function saveSchedulingSettings(
  input: SettingsScheduling
): Promise<void> {
  if (!isValidTimezone(input.timezone)) {
    throw new Error(`Zona horaria inválida: ${input.timezone}`);
  }
  if (!(input.sessionDuration > 0)) {
    throw new Error("La duración de la sesión debe ser mayor a 0 minutos.");
  }
  await updateSettings({
    work_hours: JSON.stringify(input.workHours),
    timezone: input.timezone,
    session_duration: Math.round(input.sessionDuration),
  });
}

export async function saveGoogleTokens(
  tokens: GoogleTokens | null
): Promise<void> {
  await updateSettings({
    google_tokens: tokens ? JSON.stringify(tokens) : null,
  });
}

export function isValidTimezone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export async function applySettingsUpdate(patch: SettingsUpdate): Promise<void> {
  await updateSettings(patch);
}
