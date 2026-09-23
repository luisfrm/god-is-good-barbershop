import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  getAppointmentStats,
  listAppointmentsAdmin,
} from "@/server/services/appointments";
import { getContentOrThrow } from "@/server/services/content";
import { formatTimeLabel } from "@/server/scheduling/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard · Panel",
};

export default async function DashboardPage() {
  const [stats, upcoming, meta] = await Promise.all([
    getAppointmentStats(),
    listAppointmentsAdmin(),
    getContentOrThrow("site.meta"),
  ]);

  const pending = stats.byStatus.pending ?? 0;
  const confirmed = stats.byStatus.confirmed ?? 0;
  const completed = stats.byStatus.completed ?? 0;
  const cancelled = stats.byStatus.cancelled ?? 0;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
  }).format(new Date());

  const todays = upcoming.filter((a) => a.date === today);
  const nextUp = upcoming
    .filter((a) => a.date >= today && a.status !== "cancelled")
    .slice(0, 8);

  const cards = [
    {
      label: "Total citas",
      value: stats.total,
      icon: CalendarDays,
    },
    { label: "Pendientes", value: pending, icon: Clock },
    { label: "Confirmadas", value: confirmed, icon: CalendarCheck },
    { label: "Completadas", value: completed, icon: CheckCircle2 },
    { label: "Canceladas", value: cancelled, icon: XCircle },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          {meta.name} · resumen de citas y actividad.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-background p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-foreground">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">Hoy</h2>
            <span className="text-sm text-muted-foreground">
              {todays.length} cita(s)
            </span>
          </div>
          {todays.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay citas programadas para hoy.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {todays.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeLabel(a.start_time)} –{" "}
                      {formatTimeLabel(a.end_time)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">Próximas</h2>
            <Link
              href="/panel/appointments"
              className="text-sm text-primary hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          {nextUp.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin citas próximas.</p>
          ) : (
            <ul className="divide-y divide-border">
              {nextUp.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.date} · {formatTimeLabel(a.start_time)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    confirmed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    completed: "bg-sky-500/15 text-sky-600 border-sky-500/30",
    cancelled: "bg-red-500/15 text-red-600 border-red-500/30",
  };
  const labels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? ""}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
