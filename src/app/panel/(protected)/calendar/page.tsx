import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSchedulingSettings } from "@/server/services/settings";
import { getBlockedDatesFrom } from "@/server/services/blockedDates";
import {
  listAppointmentsByRange,
  todayKey,
} from "@/server/services/appointments";
import { formatTimeLabel } from "@/server/scheduling/time";
import {
  CALENDAR_WEEKDAY_LABELS,
  dayOfMonth,
  firstDateOfMonth,
  formatMonthLabel,
  lastDateOfMonth,
  monthGrid,
  monthKeyFromDateKey,
  parseMonthKey,
  shiftMonthKey,
} from "@/server/scheduling/calendar";
import type { Appointment, AppointmentStatus } from "@/types/scheduling";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendario · Panel",
};

interface PageProps {
  searchParams: Promise<{ month?: string; day?: string }>;
}

const STATUS_DOT: Record<AppointmentStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-emerald-500",
  completed: "bg-sky-500",
  cancelled: "bg-red-500",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const scheduling = await getSchedulingSettings();
  const today = todayKey(scheduling.timezone);
  const monthKey = parseMonthKey(params.month, monthKeyFromDateKey(today));
  const from = firstDateOfMonth(monthKey);
  const to = lastDateOfMonth(monthKey);

  const [appointments, blocked] = await Promise.all([
    listAppointmentsByRange(from, to),
    getBlockedDatesFrom(from),
  ]);

  const byDate = new Map<string, Appointment[]>();
  for (const a of appointments) {
    const list = byDate.get(a.date) ?? [];
    list.push(a);
    byDate.set(a.date, list);
  }
  const blockedMap = new Map(
    blocked
      .filter((b) => b.date.slice(0, 7) === monthKey)
      .map((b) => [b.date, b.reason])
  );

  const selectedDay =
    params.day && params.day.slice(0, 7) === monthKey
      ? params.day
      : today.slice(0, 7) === monthKey
        ? today
        : (appointments[0]?.date ?? from);

  const selected = byDate.get(selectedDay) ?? [];
  const prevMonth = shiftMonthKey(monthKey, -1);
  const nextMonth = shiftMonthKey(monthKey, 1);
  const active = appointments.filter((a) => a.status !== "cancelled").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Calendario
          </h1>
          <p className="mt-1 text-muted-foreground">
            {active} cita(s) activa(s) en {formatMonthLabel(monthKey)}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/panel/calendar?month=${prevMonth}`}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Link>
          <Link
            href="/panel/calendar"
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm hover:bg-muted"
          >
            Hoy
          </Link>
          <Link
            href={`/panel/calendar?month=${nextMonth}`}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-muted"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xs">
        <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {CALENDAR_WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-2">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthGrid(monthKey).map((cell) => {
            const dayAppointments = byDate.get(cell.date) ?? [];
            const isBlocked = blockedMap.has(cell.date);
            const isToday = cell.date === today;
            const isSelected = cell.date === selectedDay;
            return (
              <Link
                key={cell.date}
                href={`/panel/calendar?month=${monthKey}&day=${cell.date}`}
                className={`min-h-[96px] border-b border-r border-border p-2 text-left align-top transition last:border-r-0 hover:bg-muted/40 ${
                  cell.inMonth ? "" : "bg-muted/30 text-muted-foreground/60"
                } ${isSelected ? "ring-2 ring-inset ring-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      isToday
                        ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground"
                        : "font-medium"
                    }`}
                  >
                    {dayOfMonth(cell.date)}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                {isBlocked && (
                  <span className="mt-1 block truncate rounded bg-destructive/10 px-1 text-[10px] text-destructive">
                    Cerrado{blockedMap.get(cell.date) ? `: ${blockedMap.get(cell.date)}` : ""}
                  </span>
                )}

                <div className="mt-1 space-y-0.5">
                  {dayAppointments.slice(0, 3).map((a) => (
                    <span
                      key={a.id}
                      className="flex items-center gap-1 truncate text-[11px] text-muted-foreground"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          STATUS_DOT[a.status]
                        }`}
                      />
                      <span className="truncate">
                        {a.start_time} {a.name}
                      </span>
                    </span>
                  ))}
                  {dayAppointments.length > 3 && (
                    <span className="block text-[10px] text-muted-foreground">
                      +{dayAppointments.length - 3} más
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-bold">{selectedDay}</h2>
          <Link
            href={`/panel/appointments?date=${selectedDay}`}
            className="text-sm text-primary hover:underline"
          >
            Gestionar citas de este día →
          </Link>
        </div>

        {selected.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin citas este día.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {selected.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-medium text-foreground">{a.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeLabel(a.start_time)} – {formatTimeLabel(a.end_time)}{" "}
                    · {a.email}
                  </p>
                </div>
                <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span
                    className={`h-2 w-2 rounded-full ${STATUS_DOT[a.status]}`}
                  />
                  {STATUS_LABELS[a.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
