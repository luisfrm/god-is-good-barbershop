import type { Metadata } from "next";
import Link from "next/link";
import { listAppointmentsAdmin } from "@/server/services/appointments";
import { getDashboardAnalytics } from "@/server/services/analytics";
import { getContentOrThrow } from "@/server/services/content";
import { formatTimeLabel } from "@/server/scheduling/time";
import AnalyticsPanels from "./AnalyticsPanels";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard · Panel",
};

export default async function DashboardPage() {
  const [analytics, appointments, meta] = await Promise.all([
    getDashboardAnalytics(),
    listAppointmentsAdmin(),
    getContentOrThrow("site.meta"),
  ]);

  const today = analytics.today;
  const todays = appointments.filter((a) => a.date === today);
  const nextUp = appointments
    .filter((a) => a.date >= today && a.status !== "cancelled")
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          {meta.name} · analíticas de citas y actividad.
        </p>
      </div>

      <AnalyticsPanels analytics={analytics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">Hoy</h2>
            <span className="text-sm text-muted-foreground">
              {todays.length} cita(s) · {today}
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
