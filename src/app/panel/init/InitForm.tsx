"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Scissors, ShieldCheck } from "lucide-react";
import { initPanelAction } from "@/app/panel/actions";
import { Button } from "@/components/ui/button";
import { FormError, SubmitButton } from "@/components/panel/FormError";
import { COMMON_TIMEZONES } from "@/lib/timezones";
import {
  SCHEDULE_PRESETS,
  WEEKDAYS,
  WEEKDAY_LABELS,
  type SchedulePreset,
} from "@/types/scheduling";
import type { SettingsBusiness, SettingsScheduling } from "@/server/models";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none";

interface InitFormProps {
  business: SettingsBusiness;
  scheduling: SettingsScheduling;
}

export default function InitForm({ business, scheduling }: InitFormProps) {
  const [state, formAction, pending] = useActionState(initPanelAction, {
    error: null as string | null,
  });
  const [preset, setPreset] = useState<SchedulePreset>("monFri");

  return (
    <div className="min-h-dvh bg-muted p-4 sm:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Scissors className="h-8 w-8 text-primary" />
          <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            God&apos;s Good
          </span>
        </div>

        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Configuración inicial
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold text-foreground">
            Configura tu panel
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea la cuenta administradora, los datos del negocio y el horario de
            atención. Podrás cambiarlo todo después.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold">
              1. Cuenta administradora
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" name="name" required autoComplete="name" />
              <Field
                label="Email"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              <Field
                label="Teléfono"
                name="adminPhone"
                type="tel"
                required
                placeholder="+58 424 000 0000"
              />
              <Field
                label="Contraseña"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
              />
              <Field
                label="Confirmar contraseña"
                name="confirm-password"
                type="password"
                required
                minLength={8}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold">2. Datos del negocio</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre del negocio"
                name="businessName"
                required
                defaultValue={business.businessName}
              />
              <Field
                label="Nombre corto"
                name="shortName"
                defaultValue={business.shortName}
              />
              <Field label="Eslogan" name="slogan" defaultValue={business.slogan} />
              <Field label="Tagline" name="tagline" defaultValue={business.tagline} />
              <label className="text-sm font-medium sm:col-span-2">
                Descripción
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={business.description}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <Field
                label="Teléfono (visible)"
                name="phoneDisplay"
                defaultValue={business.phoneDisplay}
              />
              <Field
                label="Teléfono (enlace)"
                name="phone"
                defaultValue={business.phone}
                required
                placeholder="+584240000000"
              />
              <Field
                label="WhatsApp URL"
                name="whatsappUrl"
                defaultValue={business.whatsappUrl}
              />
              <Field
                label="Email público"
                name="businessEmail"
                type="email"
                defaultValue={business.email}
              />
              <Field label="Dirección" name="address" defaultValue={business.address} />
              <Field label="Maps URL" name="mapsUrl" defaultValue={business.mapsUrl} />
              <Field
                label="Desde (año)"
                name="since"
                type="number"
                defaultValue={String(business.since)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold">3. Horario y citas</h2>

            <input type="hidden" name="schedulePreset" value={preset} />

            <div className="mt-4 space-y-3">
              <span className="text-sm font-medium">Días de atención</span>
              <div className="flex flex-wrap gap-2">
                {SCHEDULE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPreset(p.id)}
                    aria-pressed={preset === p.id}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                      preset === p.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="block font-semibold">{p.label}</span>
                    <span className="block text-[10px] opacity-80">{p.hint}</span>
                  </button>
                ))}
              </div>

              {preset === "custom" && (
                <div className="flex flex-wrap gap-3 rounded-lg border border-border p-3">
                  {WEEKDAYS.map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-2 text-sm font-medium"
                    >
                      <input
                        type="checkbox"
                        name="days"
                        value={day}
                        defaultChecked={
                          day !== "sunday" &&
                          scheduling.workHours.some((d) => d.day === day)
                        }
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      {WEEKDAY_LABELS[day]}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              </label>
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
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Los días se abrirán de 09:00 a 18:00; ajústalos luego en Ajustes →
              Horarios.
            </p>
          </section>

          <div className="flex flex-col items-center gap-3">
            <FormError error={state?.error} />
            <SubmitButton className="h-11 w-full rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {pending ? "Configurando..." : "Crear panel y entrar"}
            </SubmitButton>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Volver al sitio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue = "",
  type = "text",
  required = false,
  minLength,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputClass} mt-1`}
      />
    </label>
  );
}
