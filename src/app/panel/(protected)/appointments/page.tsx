import type { Metadata } from "next";
import Link from "next/link";
import { listAppointmentsAdmin } from "@/server/services/appointments";
import { formatTimeLabel } from "@/server/scheduling/time";
import { APPOINTMENT_STATUSES, type AppointmentStatus } from "@/types/scheduling";
import AppointmentRowActions from "./AppointmentRowActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Citas · Panel",
};

interface PageProps {
  searchParams: Promise<{ status?: string; date?: string; q?: string }>;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

export default async function AppointmentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status =
    params.status && APPOINTMENT_STATUSES.includes(params.status as AppointmentStatus)
      ? (params.status as AppointmentStatus)
      : undefined;
  const date = params.date || undefined;
  const query = params.q?.trim() || undefined;

  const appointments = await listAppointmentsAdmin({ status, date, query });

  const filters = new URLSearchParams();
  if (status) filters.set("status", status);
  if (date) filters.set("date", date);
  if (query) filters.set("q", query);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Citas
          </h1>
          <p className="mt-1 text-muted-foreground">
            {appointments.length} resultado(s)
          </p>
        </div>

        <form className="flex flex-wrap items-center gap-2" method="get">
          <input
            type="search"
            name="q"
            placeholder="Buscar nombre, email o teléfono"
            defaultValue={query ?? ""}
            className="h-9 w-56 rounded-md border border-input bg-background px-3 text-sm"
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todos los estados</option>
            {APPOINTMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="date"
            defaultValue={date ?? ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
          <ButtonSubmit />
          <Link
            href={`/api/appointments/export?${filters.toString()}`}
            prefetch={false}
            className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            Exportar CSV
          </Link>
          {(status || date || query) && (
            <Link
              href="/panel/appointments"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-xs">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha / Hora</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Mensaje</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No hay citas con estos filtros.
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{a.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeLabel(a.start_time)} –{" "}
                      {formatTimeLabel(a.end_time)}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{a.email}</p>
                    <p className="text-xs">{a.phone}</p>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                    {a.message || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                    {a.google_event_id && (
                      <span className="mt-1 block text-[10px] text-emerald-600">
                        ✓ Google Calendar
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <AppointmentRowActions appointment={a} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filters.toString() && (
        <p className="text-xs text-muted-foreground">
          Filtros activos: ?{filters.toString()}
        </p>
      )}
    </div>
  );
}

function ButtonSubmit() {
  return (
    <button
      type="submit"
      className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      Filtrar
    </button>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    confirmed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    completed: "bg-sky-500/15 text-sky-600 border-sky-500/30",
    cancelled: "bg-red-500/15 text-red-600 border-red-500/30",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
