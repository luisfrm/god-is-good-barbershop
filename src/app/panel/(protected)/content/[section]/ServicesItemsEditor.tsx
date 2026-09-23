"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ServiceItem } from "@/types/cms";

const ICON_OPTIONS = [
  "scissors",
  "beard",
  "spray",
  "crown",
  "sparkles",
  "droplets",
];

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none";

interface ServicesItemsEditorProps {
  initialItems: ServiceItem[];
}

export default function ServicesItemsEditor({
  initialItems,
}: ServicesItemsEditorProps) {
  const [items, setItems] = useState<ServiceItem[]>(() =>
    initialItems.length > 0
      ? initialItems.map((i) => ({ ...i }))
      : [{ name: "", price: "", description: "", icon: "scissors" }]
  );

  const update = (index: number, patch: Partial<ServiceItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.filter((i) => i.name && i.price))}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Servicios</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              { name: "", price: "", description: "", icon: "scissors" },
            ])
          }
        >
          + Añadir servicio
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-border p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-medium">
                Nombre
                <input
                  required
                  value={item.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="text-xs font-medium">
                Precio
                <input
                  required
                  value={item.price}
                  onChange={(e) => update(index, { price: e.target.value })}
                  className={`${inputClass} mt-1`}
                  placeholder="25€"
                />
              </label>
            </div>
            <label className="text-xs font-medium">
              Descripción
              <textarea
                required
                rows={2}
                value={item.description}
                onChange={(e) => update(index, { description: e.target.value })}
                className={`${inputClass} mt-1`}
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs font-medium">
                Icono
                <select
                  value={item.icon}
                  onChange={(e) => update(index, { icon: e.target.value })}
                  className={`${inputClass} mt-1`}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="h-9 rounded-md border border-destructive/40 px-3 text-xs text-destructive hover:bg-destructive/10"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay servicios. Añade al menos uno.
        </p>
      )}
    </div>
  );
}
