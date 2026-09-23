"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/types/cms";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none";

interface NavItemsEditorProps {
  initialItems: NavItem[];
}

export default function NavItemsEditor({ initialItems }: NavItemsEditorProps) {
  const [items, setItems] = useState<NavItem[]>(() =>
    initialItems.length > 0
      ? initialItems.map((i) => ({ ...i }))
      : [{ text: "", href: "" }]
  );

  const update = (index: number, patch: Partial<NavItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const move = (index: number, delta: number) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const serialized = items.filter((i) => i.text.trim() && i.href.trim());

  return (
    <div className="space-y-3">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(serialized)}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Elementos del menú</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setItems((prev) => [...prev, { text: "", href: "" }])}
        >
          + Añadir enlace
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
          >
            <label className="text-xs font-medium">
              Texto
              <input
                required
                value={item.text}
                onChange={(e) => update(index, { text: e.target.value })}
                className={`${inputClass} mt-1`}
                placeholder="Inicio"
              />
            </label>
            <label className="text-xs font-medium">
              Enlace
              <input
                required
                value={item.href}
                onChange={(e) => update(index, { href: e.target.value })}
                className={`${inputClass} mt-1`}
                placeholder="/o #seccion"
              />
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="h-9 rounded-md border border-border px-2 text-xs hover:bg-muted disabled:opacity-40"
                aria-label="Subir"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                className="h-9 rounded-md border border-border px-2 text-xs hover:bg-muted disabled:opacity-40"
                aria-label="Bajar"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  setItems((prev) => prev.filter((_, i) => i !== index))
                }
                className="h-9 rounded-md border border-destructive/40 px-2 text-xs text-destructive hover:bg-destructive/10"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>

      {serialized.length === 0 && (
        <p className="text-sm text-destructive">
          Debe haber al menos un elemento de navegación.
        </p>
      )}
    </div>
  );
}
