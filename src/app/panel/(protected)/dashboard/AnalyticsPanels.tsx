import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Gauge,
  Minus,
  TrendingUp,
} from "lucide-react";
import type { DashboardAnalytics } from "@/server/services/analytics";
import type { StatusSlice } from "@/server/scheduling/analytics";
import { formatShortDate } from "@/server/scheduling/analytics";
import { cn } from "@/lib/utils";

interface AnalyticsPanelsProps {
  analytics: DashboardAnalytics;
}

function conicGradient(statuses: StatusSlice[]): string {
  const total = statuses.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return "conic-gradient(#e5e7eb 0% 100%)";
  let acc = 0;
  const parts = statuses
    .filter((s) => s.count > 0)
    .map((s) => {
      const start = (acc / total) * 100;
      acc += s.count;
      const end = (acc / total) * 100;
      return `${s.color} ${start}% ${end}%`;
    });
  return `conic-gradient(${parts.join(", ")})`;
}

export default function AnalyticsPanels({ analytics }: AnalyticsPanelsProps) {
  const { kpis, days, statuses, hourly, timezone } = analytics;
  const maxDay = Math.max(...days.map((d) => d.total), 1);
  const maxHour = Math.max(...hourly.map((h) => h.count), 1);

  const trend = kpis.trendPercent;
  const trendUp = trend !== null && trend > 0;
  const trendDown = trend !== null && trend < 0;

  const kpiCards = [
    {
      label: `Citas (${analytics.windowDays} días)`,
      value: kpis.windowTotal,
      hint:
        trend === null
          ? "sin periodo anterior"
          : `${trend > 0 ? "+" : ""}${trend}% vs anterior`,
      icon: Activity,
      trend,
    },
    {
      label: "Hoy",
      value: kpis.todayCount,
      hint: `${kpis.upcoming} próximas en 7 días`,
      icon: Clock,
    },
    {
      label: "Tasa de completadas",
      value: `${kpis.completionRate}%`,
      hint: `${kpis.completed} de ${kpis.total} citas`,
      icon: TrendingUp,
    },
    {
      label: "Ocupación 7 días",
      value: `${kpis.occupancy}%`,
      hint: `${kpis.freeSlots} espacios libres`,
      icon: Gauge,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-background p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <p className="mt-3 font-serif text-3xl font-bold text-foreground">
              {card.value}
            </p>
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                trendUp ? "text-emerald-600" : "text-muted-foreground",
                trendDown && "text-red-500"
              )}
            >
              {card.trend !== undefined &&
                card.trend !== null &&
                (card.trend > 0 ? (
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                ) : card.trend < 0 ? (
                  <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Minus className="h-3 w-3" aria-hidden="true" />
                ))}
              {card.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-background p-6 shadow-xs lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">Actividad diaria</h2>
            <span className="text-xs text-muted-foreground">
              Últimos {analytics.windowDays} días · {timezone}
            </span>
          </div>

          <div className="flex h-40 items-end gap-1 sm:gap-2">
            {days.map((day) => (
              <div
                key={day.date}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
                title={`${day.date}: ${day.total} cita(s)`}
              >
                <span className="text-[10px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {day.total}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-md bg-primary/25 transition-all duration-300 group-hover:bg-primary",
                    day.total === 0 && "bg-border"
                  )}
                  style={{
                    height: day.total === 0 ? "3px" : `${(day.total / maxDay) * 100}%`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {formatShortDate(day.date)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <h2 className="font-serif text-xl font-bold">Estados</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {kpis.total} citas históricas
          </p>

          <div className="mt-5 flex items-center gap-5">
            <div
              className="relative h-28 w-28 shrink-0 rounded-full"
              style={{ background: conicGradient(statuses) }}
              role="img"
              aria-label="Distribución de citas por estado"
            >
              <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-background">
                <span className="font-serif text-xl font-bold">
                  {kpis.completionRate}%
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  completadas
                </span>
              </div>
            </div>
            <ul className="flex-1 space-y-2 text-sm">
              {statuses.map((slice) => (
                <li
                  key={slice.status}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: slice.color }}
                      aria-hidden="true"
                    />
                    {slice.label}
                  </span>
                  <span className="font-medium text-foreground">
                    {slice.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/panel/calendar"
            className="mt-5 inline-block text-sm text-primary hover:underline"
          >
            Abrir calendario →
          </Link>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <h2 className="font-serif text-xl font-bold">
            Horas más solicitadas
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Según las citas de los últimos {analytics.windowDays} días.
          </p>
          {hourly.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Todavía no hay datos suficientes.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {hourly.map((slot) => (
                <li key={slot.hour} className="flex items-center gap-3">
                  <span className="w-14 text-sm font-medium text-foreground">
                    {slot.label}
                  </span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${(slot.count / maxHour) * 100}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-sm text-muted-foreground">
                    {slot.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
          <h2 className="font-serif text-xl font-bold">Resumen</h2>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Promedio por día</dt>
              <dd className="mt-1 font-serif text-2xl font-bold">
                {kpis.averagePerDay}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cancelaciones</dt>
              <dd className="mt-1 font-serif text-2xl font-bold">
                {kpis.cancellationRate}%
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pendientes</dt>
              <dd className="mt-1 font-serif text-2xl font-bold">
                {kpis.pending}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Confirmadas</dt>
              <dd className="mt-1 font-serif text-2xl font-bold">
                {kpis.confirmed}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-muted-foreground">
            Ocupación calculada sobre {kpis.totalSlots} espacios disponibles en
            los próximos 7 días.
          </p>
        </section>
      </div>
    </div>
  );
}
