import type { Metadata } from "next";
import Link from "next/link";
import { disconnectGoogleAction, saveBusinessAction } from "@/app/panel/actions";
import { getBusinessSettings } from "@/server/services/settings";
import { FormError, SubmitButton } from "@/components/panel/FormError";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ajustes · Panel",
};

interface PageProps {
  searchParams: Promise<{ saved?: string; google?: string; error?: string }>;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none";

export default async function SettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const business = await getBusinessSettings();
  const saveBusiness = saveBusinessAction.bind(null, null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Ajustes
        </h1>
        <p className="mt-1 text-muted-foreground">
          Datos de contacto, marca y Google Calendar.
        </p>
      </div>

      {params.saved && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Cambios guardados correctamente.
        </div>
      )}
      {params.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </div>
      )}
      {params.google && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            params.google === "connected"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              : "border-amber-500/30 bg-amber-500/10 text-amber-700"
          }`}
        >
          {params.google === "connected"
            ? "Google Calendar conectado."
            : params.google === "missing_config"
              ? "Faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en el entorno."
              : params.google === "disconnected"
                ? "Google Calendar desconectado."
                : "No se pudo conectar con Google Calendar."}
        </div>
      )}

      <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <h2 className="font-serif text-xl font-bold">Marca y contacto</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Teléfono, dirección, mapsUrl, WhatsApp y metadatos de la marca.
        </p>

        <form action={saveBusiness} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del negocio" name="businessName" defaultValue={business.businessName} />
          <Field label="Nombre corto" name="shortName" defaultValue={business.shortName} />
          <Field label="Eslogan" name="slogan" defaultValue={business.slogan} />
          <Field label="Tagline" name="tagline" defaultValue={business.tagline} />
          <label className="text-sm font-medium sm:col-span-2">
            Descripción SEO
            <textarea
              name="description"
              defaultValue={business.description}
              rows={3}
              className={`${inputClass} mt-1`}
            />
          </label>
          <Field label="Desde (año)" name="since" type="number" defaultValue={String(business.since)} />
          <Field label="Teléfono (href)" name="phone" defaultValue={business.phone} />
          <Field label="Teléfono (visible)" name="phoneDisplay" defaultValue={business.phoneDisplay} />
          <Field label="Email" name="email" type="email" defaultValue={business.email} />
          <Field label="WhatsApp URL" name="whatsappUrl" defaultValue={business.whatsappUrl} />
          <Field label="Dirección" name="address" defaultValue={business.address} />
          <Field label="Maps URL" name="mapsUrl" defaultValue={business.mapsUrl} />

          <div className="sm:col-span-2">
            <FormError />
            <SubmitButton>Guardar contacto</SubmitButton>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold">Google Calendar</h2>
            <p className="text-sm text-muted-foreground">
              Conecta tu calendario para sincronizar citas automáticamente.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/api/google/auth"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Conectar
            </Link>
            <form action={disconnectGoogleAction}>
              <button
                type="submit"
                className="h-9 rounded-md border border-border px-4 text-sm hover:bg-muted"
              >
                Desconectar
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-background p-6 shadow-xs">
        <h2 className="font-serif text-xl font-bold">Horarios y duración</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Disponibilidad pública de /reservar y duración de cada cita.
        </p>
        <Link
          href="/panel/settings/scheduling"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          Configurar horarios y duración →
        </Link>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required
        className={`${inputClass} mt-1`}
      />
    </label>
  );
}
