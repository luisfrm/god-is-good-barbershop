/**
 * Scheduling types: work hours, availability, appointments, Google tokens.
 */

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_FROM_INDEX: Record<number, Weekday> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export interface TimeRange {
  start: string;
  end: string;
}

export interface WorkDaySchedule {
  day: Weekday;
  ranges: TimeRange[];
}

export interface GeneratedSlot extends TimeRange {
  booked: boolean;
}

export interface GeneratedDay {
  date: string;
  weekday: Weekday;
  slots: GeneratedSlot[];
}

export interface PublicAvailability {
  timezone: string;
  sessionDuration: number;
  days: GeneratedDay[];
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  status: AppointmentStatus;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewAppointmentInput {
  name: string;
  email: string;
  phone: string;
  message?: string;
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface BlockedDate {
  date: string;
  reason: string;
  created_at: string;
}

export interface GoogleTokens {
  access_token: string;
  refresh_token: string | null;
  scope: string;
  token_type: string;
  expires_at: number;
  email?: string | null;
}

export const DEFAULT_TIMEZONE = "America/Caracas";
export const DEFAULT_SESSION_DURATION = 45;

/** Default opening range used when applying a schedule preset. */
export const DEFAULT_WORK_RANGE: TimeRange = { start: "09:00", end: "18:00" };

export type SchedulePreset = "everyday" | "monFri" | "weekends" | "custom";

export const SCHEDULE_PRESETS: {
  id: SchedulePreset;
  label: string;
  hint: string;
}[] = [
  { id: "everyday", label: "Todos los días", hint: "Lun a Dom" },
  { id: "monFri", label: "Lunes a viernes", hint: "Lun, Mar, Mié, Jue, Vie" },
  { id: "weekends", label: "Fines de semana", hint: "Sáb, Dom" },
  { id: "custom", label: "Personalizado", hint: "Elige los días" },
];

export const PRESET_WEEKDAYS: Record<Exclude<SchedulePreset, "custom">, Weekday[]> =
  {
    everyday: [...WEEKDAYS],
    monFri: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    weekends: ["saturday", "sunday"],
  };
