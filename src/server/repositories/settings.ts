import { getDb } from "@/server/db";
import type { SettingsRow } from "@/server/models";

export async function findSettings(): Promise<SettingsRow | null> {
  return (await getDb()).prepare("SELECT * FROM settings WHERE id = 1").first<SettingsRow>();
}

export interface SettingsUpdate {
  business_name?: string;
  short_name?: string;
  slogan?: string;
  tagline?: string;
  description?: string;
  since?: number;
  phone?: string;
  phone_display?: string;
  whatsapp_url?: string;
  email?: string;
  address?: string;
  maps_url?: string;
  work_hours?: string;
  timezone?: string;
  session_duration?: number;
  google_tokens?: string | null;
}

export async function updateSettings(patch: SettingsUpdate): Promise<void> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;

  const columns = entries.map(([key]) => `${key} = ?`).join(", ");
  const values = entries.map(([, v]) => v as string | number | null);

  await (await getDb())
    .prepare(
      `UPDATE settings SET ${columns}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = 1`
    )
    .bind(...values)
    .run();
}
