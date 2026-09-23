import type { Metadata } from "next";
import Link from "next/link";
import BookingForm from "@/components/booking/BookingForm";
import { getAvailability } from "@/server/services/appointments";
import { getContentOrThrow } from "@/server/services/content";
import { getBusinessSettings, getSchedulingSettings } from "@/server/services/settings";
import { formatTimeLabel } from "@/server/scheduling/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservar cita",
  description: "Elige día y hora para tu cita en God's Good BarberShop.",
};

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string }>;
}) {
  const params = await searchParams;
  const [availability, scheduling, business, meta] = await Promise.all([
    getAvailability(14),
    getSchedulingSettings(),
    getBusinessSettings(),
    getContentOrThrow("site.meta"),
  ]);

  const firstOpen = scheduling.workHours[0];

  return (
    <main className="min-h-dvh bg-background pt-16">
      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver al inicio
        </Link>

        <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          {meta.shortName}
        </span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Reserva tu cita
        </h1>
        <p className="mt-4 text-muted-foreground">
          Elige día y hora ({scheduling.sessionDuration} min por cita). También
          puedes escribirnos por{" "}
          <a
            href={business.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            WhatsApp
          </a>
          .
        </p>

        {params.booked && (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            ¡Reserva recibida! Te contactaremos para confirmar.
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-background p-6 shadow-xs sm:p-8">
          <BookingForm availability={availability} />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-muted p-6 text-sm text-muted-foreground">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Horario de la barbería
          </h2>
          <ul className="mt-2 space-y-1">
            {scheduling.workHours.map((day) => (
              <li key={day.day} className="flex justify-between gap-4">
                <span className="capitalize">{day.day}</span>
                <span>
                  {day.ranges
                    .map(
                      (r) =>
                        `${formatTimeLabel(r.start)} – ${formatTimeLabel(r.end)}`
                    )
                    .join(", ")}
                </span>
              </li>
            ))}
            {firstOpen && (
              <li className="pt-2 text-xs">Zona horaria: {scheduling.timezone}</li>
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
