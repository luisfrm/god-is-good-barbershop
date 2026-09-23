"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_WORK_RANGE,
  SCHEDULE_PRESETS,
  WEEKDAYS,
  WEEKDAY_LABELS,
  type SchedulePreset,
  type TimeRange,
  type WorkDaySchedule,
} from "@/types/scheduling";
import {
  buildScheduleForPreset,
  detectSchedulePreset,
} from "@/server/scheduling/presets";

const inputClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]";

interface WorkHoursEditorProps {
  initialWorkHours: WorkDaySchedule[];
}

export default function WorkHoursEditor({
  initialWorkHours,
}: WorkHoursEditorProps) {
  const [days, setDays] = useState<WorkDaySchedule[]>(() => {
    const map = new Map(
      initialWorkHours.map((d) => [d.day, d.ranges.map((r) => ({ ...r }))])
    );
    return WEEKDAYS.map((day) => ({
      day,
      ranges: map.get(day) ?? [],
    }));
  });

  const [defaultRange, setDefaultRange] = useState<TimeRange>(() => {
    const firstRange = initialWorkHours.find((d) => d.ranges.length > 0)
      ?.ranges[0];
    return firstRange ? { ...firstRange } : { ...DEFAULT_WORK_RANGE };
  });

  const activePreset = useMemo(() => detectSchedulePreset(days), [days]);

  const setRanges = (day: WorkDaySchedule["day"], ranges: TimeRange[]) => {
    setDays((prev) => prev.map((d) => (d.day === day ? { ...d, ranges } : d)));
  };

  const applyPreset = (preset: SchedulePreset) => {
    if (preset === "custom") {
      // Keep the current selection; the per-day toggles below take over.
      setDays((prev) => prev.map((d) => ({ ...d, ranges: [...d.ranges] })));
      return;
    }
    setDays(buildScheduleForPreset(preset, defaultRange, days));
  };

  const toggleDay = (day: WorkDaySchedule["day"], open: boolean) => {
    setRanges(
      day,
      open ? [{ ...defaultRange }] : []
    );
  };

  const serialize = days.filter((d) => d.ranges.length > 0);

  return (
    <div className="space-y-6">
      <input type="hidden" name="workHours" value={JSON.stringify(serialize)} />

      <div className="space-y-3">
        <span className="text-sm font-medium">Plantilla rápida</span>
        <div className="flex flex-wrap gap-2">
          {SCHEDULE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              aria-pressed={activePreset === preset.id}
              title={preset.hint}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                activePreset === preset.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <span className="block font-semibold">{preset.label}</span>
              <span className="block text-[10px] opacity-80">
                {preset.hint}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Elige una plantilla y ajusta los días en «Personalizado». Al activar un
          día se usa el horario general de abajo.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[200px_1fr] sm:items-center">
        <span className="text-sm font-medium">Horario general</span>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="time"
            value={defaultRange.start}
            onChange={(e) =>
              setDefaultRange((r) => ({ ...r, start: e.target.value }))
            }
            className={inputClass}
            aria-label="Hora de apertura por defecto"
          />
          <span>–</span>
          <input
            type="time"
            value={defaultRange.end}
            onChange={(e) =>
              setDefaultRange((r) => ({ ...r, end: e.target.value }))
            }
            className={inputClass}
            aria-label="Hora de cierre por defecto"
          />
        </div>
      </div>

      <div className="space-y-3">
        {days.map((day) => {
          const isOpen = day.ranges.length > 0;
          return (
            <div
              key={day.day}
              className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[170px_1fr_auto] sm:items-center"
            >
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={(e) => toggleDay(day.day, e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                  aria-label={`Abrir ${WEEKDAY_LABELS[day.day]}`}
                />
                {WEEKDAY_LABELS[day.day]}
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {!isOpen ? (
                  <span className="text-xs text-muted-foreground">Cerrado</span>
                ) : (
                  day.ranges.map((range, ri) => (
                    <span
                      key={ri}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs"
                    >
                      <input
                        type="time"
                        value={range.start}
                        onChange={(e) => {
                          const next = day.ranges.map((r, i) =>
                            i === ri ? { ...r, start: e.target.value } : r
                          );
                          setRanges(day.day, next);
                        }}
                        className="bg-transparent outline-none"
                        aria-label="Inicio"
                      />
                      <span>–</span>
                      <input
                        type="time"
                        value={range.end}
                        onChange={(e) => {
                          const next = day.ranges.map((r, i) =>
                            i === ri ? { ...r, end: e.target.value } : r
                          );
                          setRanges(day.day, next);
                        }}
                        className="bg-transparent outline-none"
                        aria-label="Fin"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setRanges(
                            day.day,
                            day.ranges.filter((_, i) => i !== ri)
                          )
                        }
                        className="ml-1 text-destructive"
                        aria-label="Quitar horario"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRanges(day.day, [...day.ranges, { ...defaultRange }])
                  }
                  className="h-8 rounded-md border border-border px-2 text-xs hover:bg-muted"
                >
                  + Rango
                </button>
                <button
                  type="button"
                  onClick={() => setRanges(day.day, [])}
                  className="h-8 rounded-md border border-border px-2 text-xs hover:bg-muted"
                  disabled={!isOpen}
                >
                  Cerrar día
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
