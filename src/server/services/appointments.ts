import type {
  Appointment,
  NewAppointmentInput,
  PublicAvailability,
} from "@/types/scheduling";
import {
  countAppointmentsByStatus,
  deleteAppointment,
  findAppointment,
  insertAppointment,
  listAppointments,
  listAppointmentsInRange,
  listBookedSlots,
  updateAppointmentGoogleEvent,
  updateAppointmentStatus,
} from "@/server/repositories/appointments";
import {
  getSchedulingSettings,
  getBusinessSettings,
  getGoogleTokens,
  saveGoogleTokens,
} from "@/server/services/settings";
import { buildAvailability, zonedDateKey } from "@/server/scheduling/slots";
import { getBlockedDatesFrom } from "@/server/services/blockedDates";
import { isRangeValid, normalizeTime } from "@/server/scheduling/time";
import { calculateSlotEndTime } from "@/server/scheduling/validation";
import {
  buildEventPayload,
  createCalendarEvent,
  isTokenExpired,
  refreshAccessToken,
} from "@/server/services/google";
import type { AppointmentStatus } from "@/types/scheduling";
import { APPOINTMENT_STATUSES } from "@/types/scheduling";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Today's date key (YYYY-MM-DD) rendered in the given timezone. */
export function todayKey(timeZone: string): string {
  return zonedDateKey(new Date(), timeZone);
}

export async function getAvailability(days = 14): Promise<PublicAvailability> {
  const scheduling = await getSchedulingSettings();
  const fromDate = todayKey(scheduling.timezone);
  const [booked, blocked] = await Promise.all([
    listBookedSlots(fromDate),
    getBlockedDatesFrom(fromDate),
  ]);

  const daysOut = buildAvailability(
    scheduling.workHours,
    scheduling.timezone,
    scheduling.sessionDuration,
    new Date(),
    days,
    booked,
    blocked.map((d) => d.date)
  );

  return {
    timezone: scheduling.timezone,
    sessionDuration: scheduling.sessionDuration,
    days: daysOut,
  };
}

function normalizeAppointment(a: Appointment): Appointment {
  return {
    ...a,
    start_time: normalizeTime(a.start_time),
    end_time: normalizeTime(a.end_time),
  };
}

export async function listAppointmentsAdmin(filters?: {
  status?: AppointmentStatus;
  date?: string;
  query?: string;
}): Promise<Appointment[]> {
  const rows = await listAppointments(filters);
  return rows.map(normalizeAppointment);
}

export async function listAppointmentsByRange(
  fromDate: string,
  toDate: string
): Promise<Appointment[]> {
  const rows = await listAppointmentsInRange(fromDate, toDate);
  return rows.map(normalizeAppointment);
}

export async function getAppointmentStats(): Promise<{
  byStatus: Record<string, number>;
  total: number;
}> {
  const byStatus = await countAppointmentsByStatus();
  const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
  return { byStatus, total };
}

export type CreateBookingResult =
  | { appointment: Appointment; error?: undefined }
  | { appointment?: undefined; error: string };

export async function createBooking(
  input: NewAppointmentInput
): Promise<CreateBookingResult> {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";

  if (!name || !email) return { error: "Nombre y email son obligatorios" };
  if (!phone) return { error: "El teléfono es obligatorio" };
  if (!isValidEmail(email)) return { error: "Ingresa un email válido" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { error: "Fecha de reserva inválida" };
  }

  const { sessionDuration, timezone } = await getSchedulingSettings();
  const start = normalizeTime(input.start_time);
  const end = calculateSlotEndTime(start, sessionDuration);
  if (!isRangeValid({ start, end })) return { error: "Horario inválido" };

  // Slot must exist in current availability (not outside work hours / duration).
  const availability = await getAvailability(28);
  const day = availability.days.find((d) => d.date === input.date);
  const slot = day?.slots.find((s) => s.start === start);
  if (!slot) return { error: "Ese horario no está disponible" };
  if (slot.booked) {
    return { error: "Ese horario acaba de ser reservado. Elige otro." };
  }

  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    message: input.message?.trim() || null,
    date: input.date,
    start_time: start,
    end_time: end,
    timezone: input.timezone || timezone,
    status: "pending",
    google_event_id: null,
    created_at: now,
    updated_at: now,
  };

  try {
    const created = await insertAppointment(appointment);
    // Best-effort Google sync — never fails the booking itself.
    try {
      const eventId = await syncAppointmentToGoogle(created);
      if (eventId) {
        await updateAppointmentGoogleEvent(created.id, eventId);
        created.google_event_id = eventId;
      }
    } catch (err) {
      console.error("Google Calendar sync failed:", err);
    }
    return { appointment: created };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("UNIQUE") || message.includes("constraint")) {
      return { error: "Ese horario acaba de ser reservado. Elige otro." };
    }
    return { error: "No se pudo crear la reserva. Intenta de nuevo." };
  }
}

export async function updateStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  if (!APPOINTMENT_STATUSES.includes(status)) {
    return { success: false, error: "Estado inválido" };
  }
  const existing = await findAppointment(id);
  if (!existing) return { success: false, error: "Cita no encontrada" };
  await updateAppointmentStatus(id, status);
  return { success: true };
}

export async function removeAppointment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const existing = await findAppointment(id);
  if (!existing) return { success: false, error: "Cita no encontrada" };
  await deleteAppointment(id);
  return { success: true };
}

export async function syncToGoogle(
  id: string
): Promise<{ success: boolean; googleEventId?: string; error?: string }> {
  const appointment = await findAppointment(id);
  if (!appointment) return { success: false, error: "Cita no encontrada" };
  try {
    const eventId = await syncAppointmentToGoogle(appointment);
    if (!eventId) {
      return {
        success: false,
        error: "Google Calendar no está conectado o no se pudo crear el evento.",
      };
    }
    await updateAppointmentGoogleEvent(appointment.id, eventId);
    return { success: true, googleEventId: eventId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al sincronizar",
    };
  }
}

async function syncAppointmentToGoogle(
  appointment: Appointment
): Promise<string | null> {
  const tokens = await getGoogleTokens();
  if (!tokens?.access_token) return null;

  const business = await getBusinessSettings();
  let accessToken = tokens.access_token;

  if (isTokenExpired(tokens)) {
    if (!tokens.refresh_token) return null;
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    accessToken = refreshed.access_token;
    if (tokens.email && !refreshed.email) refreshed.email = tokens.email;
    await saveGoogleTokens(refreshed);
  }

  const payload = buildEventPayload({
    summary: `Cita — ${appointment.name}`,
    description: appointment.message ?? undefined,
    location: business.address,
    startDateTime: `${appointment.date}T${appointment.start_time}:00`,
    endDateTime: `${appointment.date}T${appointment.end_time}:00`,
    timeZone: appointment.timezone,
    attendeeEmail: appointment.email,
  });

  const { id } = await createCalendarEvent(accessToken, payload);
  return id;
}
