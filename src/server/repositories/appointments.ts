import { getDb } from "@/server/db";
import type { Appointment, AppointmentStatus } from "@/types/scheduling";

export async function listAppointments(filters?: {
  status?: AppointmentStatus;
  date?: string;
  query?: string;
}): Promise<Appointment[]> {
  const clauses: string[] = [];
  const binds: string[] = [];
  if (filters?.status) {
    clauses.push("status = ?");
    binds.push(filters.status);
  }
  if (filters?.date) {
    clauses.push("date = ?");
    binds.push(filters.date);
  }
  const query = filters?.query?.trim();
  if (query) {
    clauses.push("(name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const like = `%${query}%`;
    binds.push(like, like, like);
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await (await getDb())
    .prepare(
      `SELECT * FROM appointments ${where} ORDER BY date ASC, start_time ASC`
    )
    .bind(...binds)
    .all<Appointment>();
  return rows.results;
}

export async function listAppointmentsInRange(
  fromDate: string,
  toDate: string
): Promise<Appointment[]> {
  const rows = await (await getDb())
    .prepare(
      `SELECT * FROM appointments
       WHERE date >= ?1 AND date <= ?2
       ORDER BY date ASC, start_time ASC`
    )
    .bind(fromDate, toDate)
    .all<Appointment>();
  return rows.results;
}

export async function findAppointment(id: string): Promise<Appointment | null> {
  return (await getDb())
    .prepare("SELECT * FROM appointments WHERE id = ?1")
    .bind(id)
    .first<Appointment>();
}

export async function insertAppointment(
  input: Appointment
): Promise<Appointment> {
  await (await getDb())
    .prepare(
      `INSERT INTO appointments
         (id, name, email, phone, message, date, start_time, end_time, timezone, status, google_event_id, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)`
    )
    .bind(
      input.id,
      input.name,
      input.email,
      input.phone,
      input.message,
      input.date,
      input.start_time,
      input.end_time,
      input.timezone,
      input.status,
      input.google_event_id,
      input.created_at,
      input.updated_at
    )
    .run();

  const created = await findAppointment(input.id);
  if (!created) throw new Error("Failed to create appointment");
  return created;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  await (await getDb())
    .prepare(
      `UPDATE appointments
         SET status = ?2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?1`
    )
    .bind(id, status)
    .run();
}

export async function updateAppointmentGoogleEvent(
  id: string,
  googleEventId: string
): Promise<void> {
  await (await getDb())
    .prepare(
      `UPDATE appointments
         SET google_event_id = ?2, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?1`
    )
    .bind(id, googleEventId)
    .run();
}

export async function deleteAppointment(id: string): Promise<void> {
  await (await getDb()).prepare("DELETE FROM appointments WHERE id = ?1").bind(id).run();
}

export async function listBookedSlots(fromDate: string): Promise<
  { date: string; start_time: string; status: AppointmentStatus }[]
> {
  const rows = await (await getDb())
    .prepare(
      `SELECT date, start_time, status FROM appointments
       WHERE date >= ?1 AND status <> 'cancelled'
       ORDER BY date ASC, start_time ASC`
    )
    .bind(fromDate)
    .all<{ date: string; start_time: string; status: AppointmentStatus }>();
  return rows.results;
}

export async function countAppointmentsByStatus(): Promise<
  Record<string, number>
> {
  const rows = await (await getDb())
    .prepare(
      "SELECT status, COUNT(*) AS count FROM appointments GROUP BY status"
    )
    .all<{ status: string; count: number }>();
  const out: Record<string, number> = {};
  for (const row of rows.results) out[row.status] = row.count;
  return out;
}
