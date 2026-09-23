"use client";

import { useTransition } from "react";
import {
  deleteAppointmentAction,
  syncAppointmentAction,
  updateAppointmentStatusAction,
} from "@/app/panel/actions";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/whatsapp";
import type { Appointment, AppointmentStatus } from "@/types/scheduling";

const STATUS_OPTIONS: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

interface AppointmentRowActionsProps {
  appointment: Appointment;
}

export default function AppointmentRowActions({
  appointment,
}: AppointmentRowActionsProps) {
  const [pending, startTransition] = useTransition();
  const wa = whatsappLink(
    appointment.phone,
    `Hola ${appointment.name}, te escribimos sobre tu cita del ${appointment.date} a las ${appointment.start_time}.`
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={`Estado de la cita de ${appointment.name}`}
        defaultValue={appointment.status}
        disabled={pending}
        onChange={(e) => {
          const status = e.target.value as AppointmentStatus;
          startTransition(async () => {
            await updateAppointmentStatusAction({
              id: appointment.id,
              status,
            });
          });
        }}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending || Boolean(appointment.google_event_id)}
        onClick={() => {
          startTransition(async () => {
            await syncAppointmentAction({ id: appointment.id });
          });
        }}
      >
        {appointment.google_event_id ? "En Calendario" : "Sync Google"}
      </Button>

      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
        >
          WhatsApp
        </a>
      )}

      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!confirm("¿Eliminar esta cita?")) return;
          startTransition(async () => {
            await deleteAppointmentAction({ id: appointment.id });
          });
        }}
      >
        Eliminar
      </Button>
    </div>
  );
}
