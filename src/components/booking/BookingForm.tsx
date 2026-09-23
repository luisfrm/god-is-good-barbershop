"use client";

import { useActionState, useMemo, useState } from "react";
import { bookAppointmentAction } from "@/app/panel/actions";
import { Button } from "@/components/ui/button";
import { formatTimeLabel } from "@/server/scheduling/time";
import type { PublicAvailability } from "@/types/scheduling";

// `text-base` on mobile stops iOS Safari from zooming in on focus and
// `min-h-11` gives every field a 44px touch target.
const inputClass =
  "w-full min-h-11 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none sm:text-sm";

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface BookingFormProps {
  availability: PublicAvailability;
}

export default function BookingForm({ availability }: BookingFormProps) {
  const [state, formAction, pending] = useActionState(bookAppointmentAction, {
    error: null as string | null,
  });

  const daysWithSlots = useMemo(
    () => availability.days.filter((d) => d.slots.length > 0),
    [availability.days]
  );

  const [selectedDate, setSelectedDate] = useState(
    daysWithSlots[0]?.date ?? ""
  );
  const selectedDay = daysWithSlots.find((d) => d.date === selectedDate);
  const freeSlots = selectedDay?.slots.filter((s) => !s.booked) ?? [];

  const [selectedSlot, setSelectedSlot] = useState("");

  if (daysWithSlots.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-xs">
        <p className="text-muted-foreground">
          No hay horarios disponibles por ahora. Configura los horarios en el
          panel o contáctanos por WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="date" value={selectedDate} />
      <input type="hidden" name="start_time" value={selectedSlot} />
      <input type="hidden" name="end_time" value={selectedSlot} />
      <input type="hidden" name="timezone" value={availability.timezone} />

      <div className="space-y-3">
        <span className="text-sm font-medium text-foreground">1. Elige un día</span>
        <div className="flex flex-wrap gap-2">
          {daysWithSlots.map((day) => {
            const d = new Date(`${day.date}T12:00:00Z`);
            const free = day.slots.filter((s) => !s.booked).length;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDate(day.date);
                  setSelectedSlot("");
                }}
                disabled={free === 0}
                className={`rounded-xl border px-3 py-2 text-center text-xs transition disabled:opacity-40 ${
                  selectedDate === day.date
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <span className="block font-semibold">
                  {DAY_LABELS[d.getUTCDay()]}
                </span>
                <span className="block text-sm font-medium">{d.getUTCDate()}</span>
                <span className="block text-[10px] opacity-80">{free} libre</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-sm font-medium text-foreground">
          2. Elige una hora
        </span>
        <div className="flex flex-wrap gap-2">
          {freeSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin horas libres este día. Prueba con otra fecha.
            </p>
          ) : (
            freeSlots.map((slot) => (
              <button
                key={slot.start}
                type="button"
                onClick={() => setSelectedSlot(slot.start)}
                className={`min-h-11 rounded-lg border px-3 py-2 text-sm transition ${
                  selectedSlot === slot.start
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                {formatTimeLabel(slot.start)}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Nombre
          <input name="name" required className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm font-medium">
          Email
          <input name="email" type="email" required className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm font-medium">
          Teléfono
          <input name="phone" type="tel" required className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm font-medium">
          Mensaje (opcional)
          <input name="message" className={`${inputClass} mt-1`} />
        </label>
      </div>

      {state?.error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="min-h-11 w-full sm:w-auto"
        disabled={pending || !selectedSlot}
      >
        {pending
          ? "Reservando..."
          : selectedSlot
            ? `Reservar ${selectedDate} · ${formatTimeLabel(selectedSlot)}`
            : "Selecciona día y hora"}
      </Button>
    </form>
  );
}
