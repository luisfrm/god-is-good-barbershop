import type {
  Appointment,
  AppointmentStatus,
  GoogleTokens,
  WorkDaySchedule,
} from "@/types/scheduling";

export interface UserRow {
  id: string;
  email: string;
  name: string;
  phone: string;
  password_hash: string;
  password_salt: string;
  password_iterations: number;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface SessionRow {
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface ContentRow {
  id: number;
  section: string;
  data: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsRow {
  id: number;
  business_name: string;
  short_name: string;
  slogan: string;
  tagline: string;
  description: string;
  since: number;
  phone: string;
  phone_display: string;
  whatsapp_url: string;
  email: string;
  address: string;
  maps_url: string;
  work_hours: string;
  timezone: string;
  session_duration: number;
  google_tokens: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsBusiness {
  businessName: string;
  shortName: string;
  slogan: string;
  tagline: string;
  description: string;
  since: number;
  phone: string;
  phoneDisplay: string;
  whatsappUrl: string;
  email: string;
  address: string;
  mapsUrl: string;
}

export interface SettingsScheduling {
  workHours: WorkDaySchedule[];
  timezone: string;
  sessionDuration: number;
}

export type { Appointment, AppointmentStatus, GoogleTokens };
