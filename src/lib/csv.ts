import type { Appointment, AppointmentStatus } from "@/types/scheduling";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

/** RFC 4180 field escaping: quote when the value contains , " \n or \r. */
export function escapeCsvField(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\r\n");
}

const APPOINTMENT_HEADERS = [
  "Fecha",
  "Inicio",
  "Fin",
  "Cliente",
  "Email",
  "Teléfono",
  "Estado",
  "Mensaje",
  "Google Event",
  "Creada",
];

export function appointmentsToCsv(appointments: Appointment[]): string {
  return toCsv(
    APPOINTMENT_HEADERS,
    appointments.map((a) => [
      a.date,
      a.start_time,
      a.end_time,
      a.name,
      a.email,
      a.phone,
      STATUS_LABELS[a.status] ?? a.status,
      a.message ?? "",
      a.google_event_id ?? "",
      a.created_at,
    ])
  );
}
