import type { Metadata } from "next";
import {
  addBlockedDateAction,
  removeBlockedDateAction,
  saveBusinessAction,
  saveSchedulingAction,
} from "@/app/panel/actions";
import {
  getBusinessSettings,
  getSchedulingSettings,
} from "@/server/services/settings";
import { getBlockedDates } from "@/server/services/blockedDates";
import { COMMON_TIMEZONES } from "@/lib/timezones";
import WorkHoursEditor from "../WorkHoursEditor";
import { FormError, SubmitButton } from "@/components/panel/FormError";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Horarios · Panel",
};

interface PageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none";

export default async function SchedulingSettingsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const [scheduling, business, blockedDates] = await Promise.all([
    getSchedulingSettings(),
    getBusinessSettings(),
    getBlockedDates(),
  ]);

  const saveScheduling = saveSchedulingAction.bind(null, null);
  const saveBusiness = saveBusinessAction.bind(null, null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Horarios y duración
        </h1>
        <p className="mt-1 text-muted-foreground">
          Define la disponibilidad pública de /reservar (la duración marca el
          paso entre citas) y bloquea días festivos o vacaciones.
        </p>
      </div>

      {params.saved && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Guardado correctamente.
        </div>
      )}
      {params.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <h2 className="mb-4 font-serif text-xl font-bold">
          Disponibilidad semanal
        </h2>
        <form action={saveScheduling} className="space-y-6">
          <WorkHoursEditor initialWorkHours={scheduling.workHours} />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Zona horaria
              <select
                name="timezone"
                defaultValue={scheduling.timezone}
                className={`${inputClass} mt-1`}
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Duración entre citas (minutos)
              <input
                type="number"
                name="sessionDuration"
                min={5}
                max={480}
                step={5}
                defaultValue={scheduling.sessionDuration}
                required
                className={`${inputClass} mt-1`}
              />
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                Determina cada cuánto se agenda una cita nueva (por defecto 45).
              </span>
            </label>
          </div>

          <FormError />
          <SubmitButton>Guardar horarios</SubmitButton>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <h2 className="font-serif text-xl font-bold">Días bloqueados</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Cierra días completos (festivos, vacaciones). No aparecerán
          disponibles en /reservar.
        </p>

        <form
          action={addBlockedDateAction}
          className="flex flex-wrap items-end gap-3"
        >
          <label className="text-sm font-medium">
            Fecha
            <input
              type="date"
              name="date"
              required
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-sm font-medium">
            Motivo (opcional)
            <input
              name="reason"
              placeholder="Vacaciones, feriado…"
              className={`${inputClass} mt-1`}
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Bloquear día
          </button>
        </form>

        {blockedDates.length > 0 && (
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {blockedDates.map((b) => (
              <li
                key={b.date}
                className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
              >
                <span>
                  <span className="font-medium">{b.date}</span>
                  {b.reason && (
                    <span className="ml-2 text-muted-foreground">{b.reason}</span>
                  )}
                </span>
                <form action={removeBlockedDateAction}>
                  <input type="hidden" name="date" value={b.date} />
                  <button
                    type="submit"
                    className="text-xs text-destructive hover:underline"
                  >
                    Quitar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <h2 className="mb-4 font-serif text-xl font-bold">Contacto rápido</h2>
        <form action={saveBusiness} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Teléfono (href)
            <input
              name="phone"
              defaultValue={business.phone}
              required
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-sm font-medium">
            Teléfono (visible)
            <input
              name="phoneDisplay"
              defaultValue={business.phoneDisplay}
              required
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-sm font-medium">
            Dirección
            <input
              name="address"
              defaultValue={business.address}
              required
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-sm font-medium">
            Maps URL
            <input
              name="mapsUrl"
              defaultValue={business.mapsUrl}
              required
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-sm font-medium">
            WhatsApp URL
            <input
              name="whatsappUrl"
              defaultValue={business.whatsappUrl}
              required
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              defaultValue={business.email}
              required
              className={`${inputClass} mt-1`}
            />
          </label>
          <input type="hidden" name="businessName" value={business.businessName} />
          <input type="hidden" name="shortName" value={business.shortName} />
          <input type="hidden" name="slogan" value={business.slogan} />
          <input type="hidden" name="tagline" value={business.tagline} />
          <input type="hidden" name="description" value={business.description} />
          <input type="hidden" name="since" value={String(business.since)} />

          <div className="sm:col-span-2">
            <FormError />
            <SubmitButton>Guardar contacto</SubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
